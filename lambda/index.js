// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const axios = require('axios');
const cheerio = require('cheerio');

// Global vars
var _name = '';
var _gender = '';
var _meanings = [];
var _healthAnalysis = '';

// Crawl Kabalarians asynchronously by using axios and cheerio
async function fetchMeaning(name, gender) {
    try {
        // Fetch website based on inputs
        var data = [];
        var response = await axios.get(`https://www.kabalarians.com/name-meanings/names/${gender}/${name}.htm`);
        var $ = cheerio.load(response.data);

        $('#headerOL li').each(function(i, elm) {
            data.push($(this).text().trim())
        });
        
        // return an array of meanings with the last element is the health analysis
        return data;
    } catch(error) {
        // If any of the awaited promises was rejected, this catch block
        // would catch the rejection reason, which is unlikely since we have filtered name and gender
        return null;
    }
}

// .capitalize huy -> Huy; male -> Male
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = 'Welcome to NameDaddy. Say NAME to start or HELP if you are not sure what to do!';
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const GetNameIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'GetNameIntent';
    },
    handle(handlerInput) {
        const speechText = `Hi, what's your name?`;
        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            //.reprompt()
            .reprompt(speechText)
            .getResponse();
    }
};

const GetGenderIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'GetGenderIntent';
    },
    handle(handlerInput) {
        const name = handlerInput.requestEnvelope.request.intent.slots.name.value;
        _name = name.capitalize();
        const speechText = `Hi, ${_name}, what is your gender?`
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse()
    }
};

const GetMeaningIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'GetMeaningIntent';
    },
    async handle(handlerInput) {
        
        const gender = handlerInput.requestEnvelope.request.intent.slots.gender.resolutions.resolutionsPerAuthority[0].values[0].value.name
        _gender = gender.capitalize()
        
        // Fetch values with inputs given by user
        var meanings = await fetchMeaning(_name, _gender);
        var healthAnalysis = meanings.pop();
        
        // Store to global vars (I got some trouble with this.attributes :( )
        _meanings = meanings;
        _healthAnalysis = healthAnalysis;
      
        var speechText = ""
        if (_meanings[0]) {
            speechText += _meanings[0];
        } else {
            speechText += "Name/gender combination does not exist. Say NAME to try again."
        }
        
        // Put the first value to last -> cycle repeated
        _meanings.push(_meanings.shift())
    
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const GetMoreMeaningIntentHandler = {
        canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'GetMoreMeaningIntent';
    },
    async handle(handlerInput) {
      
        // Let Alexa speak the first value and then send it to last so user could get more values
        const speechText = _meanings[0];
        _meanings.push(_meanings.shift())
    
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
}

const GetHealthAnalysisIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'GetHealthAnalysis';
    },
    handle(handlerInput) {
        const speechText = _healthAnalysis;
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
}

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'Give Alexa your name and gender so NameDaddy can find out the meaning of your name by saying NAME. You can ask for Health Analysis of your name by saying HEALTH or get the next fact by saying NEXT. Say REFRESH to start over and STOP to end.';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const RestartIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'RestartIntent');
    },
    handle(handlerInput) {
        _name = '';
        _gender = '';
        _meanings = [];
        _healthAnalysis = '';
        
        const speechText = 'Hi again, what is your name?';
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
}

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Thank you. NameDaddy hoped you found the meaning behind your name!';
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        const speechText = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.message}`);
        const speechText = `Sorry, I couldn't understand what you said. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

// This handler acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelpIntentHandler,
        GetNameIntentHandler,
        GetGenderIntentHandler,
        GetMeaningIntentHandler,
        GetMoreMeaningIntentHandler,
        GetHealthAnalysisIntentHandler,
        RestartIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler) // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    .addErrorHandlers(
        ErrorHandler)
    .lambda();