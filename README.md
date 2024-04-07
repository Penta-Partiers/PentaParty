# PentaParty
By Aaron Lin, Alphonso Dineros, and Mark Zhang

## Running Instructions
### 1. Firebase Setup
1. Go to [Google Firebase](https://firebase.google.com/) and register a new account
2. Add a new Firebase project
3. On project overview page, add a new Web App. The button to add a Web App is on the right of the Andriod icon, which has a icon of "<\\>"
4. Copy the firebase config credentials
5. Go to Firestore Database under build section, start a new database in **TEST MODE**(or you'll need to edit the [security rules](https://firebase.google.com/docs/rules/get-started?hl=en#understand_the_language))
6. Go to Authentication under build section, click get started and enable 'Email/Password' and 'Google' sign-in providers
7. Copy the example env to a new env file `cp .env.example .env`
8. Fill the new .env file with the credentials copied from firebase config
9. Run `setup.js` with this env file `node --env-file .env setup.js`

### 2. Front End Setup
1. cd into the `/frontend` directory
2. If running for the first time, run the command `npm install` to download dependencies
3. Create a `.env` file in the root of the `/frontend` directory
4. Copy the contents of `.env.example` into `.env` and fill out the corresponding information (i.e. port, Firebase configuration)
5. Run the command `npm start` and open localhost:3000 to view the frontend client