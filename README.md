# NameDaddy - *Volley*

**NameDaddy** finds the meaning of your name by crawling [Kabalarians](https://www.kabalarians.com).

Time spent: **a lot**. There is a huge learning curve with Alexa esp. AWS.

## User Stories

The following **required**:

- [x] Ask user for his or her first name and gender
- [x] Identify US first names using the AMAZON.US_FIRST_NAME slot type
- [x] Genders will probably need to be handled using a custom slot value or custom intents
- [x] Decide how to handle input that does not look like a name / gender
- [x] Create an algorithm that maps any first name and gender to a “name analysis”.
- [x] Have Alexa read out the name analysis for the user
- [x] Have Alexa ask the user whether they want to try another name or stop
- [x] Respond appropriately to interruptions
- [x] Deploy for testing on an Echo device

The following **optional**:

- [ ] Identify UK first names using the AMAZON.GB_FIRST_NAME slot type: 
- [ ] Extend these slots with a few names/nicknames that are not included by default and otherwise might not be recognized: 
- [x] Alexa can ask the user if they want more information, such as a health analysis, or could ask whether the analysis seems accurate to the user
- [ ] Remember the user’s name and change the welcome message the next time they arrive. See “Persistence Adapter” 
- [x] Come up with a better skill invocation name

## Video Walkthrough

[Demo](https://youtu.be/IM3tLbxbihY)

## Notes

Crawling async with cheerio and axios is pretty fun.

My name of Huy creates a very expressive, versatile, and spontaneous nature.

Working with AWS is not the best experience.

## License

MIT
