# PentaParty
By Aaron Lin, Alphonso Dineros, and Mark Zhang

## Setup Instructions
Before running our project for the first time, perform the following setup steps:

### 1. Prerequisities
- Download the latest version of node.js: https://nodejs.org/en

### Note
For the **TA marking team**, we have included our `.env` file, which contains the Firebase API and credentials to run this program. Therefore, the step on "Firebase Setup" can be skipped. Please start directly from step 2 "Front End Setup".

### 2. Firebase Setup (Not for TA marking team)
1. Go to [Google Firebase](https://firebase.google.com/) and register a new account
2. Add a new Firebase project
3. On project overview page, add a new Web App. The button to add a Web App is on the right of the Andriod icon, which has a icon of "<\\>"
4. Copy the firebase config credentials
5. Go to Firestore Database under build section, start a new database in **TEST MODE**(or you'll need to edit the [security rules](https://firebase.google.com/docs/rules/get-started?hl=en#understand_the_language))
6. Go to Authentication under build section, click get started and enable 'Email/Password' and 'Google' sign-in providers
7. Copy the example env to a new env file `cp .env.example .env`
8. Fill the new .env file with the credentials copied from firebase config
9. Run `setup.js` with this env file `node --env-file .env setup.js`

### 3. Front End Setup
1. In the root project directory, run the command `npm install` to download the necessary dependencies
2. In the `.env` file created from the Firebase Setup steps above, set the `PORT` field to your desired port number, which is where the project will run.
   For example, `PORT=3000` sets the port to 3000.

## Running Instructions
To start the project, run the command `npm start` in the root project directory.

## User Guide
### Creating an Account
1. When you first run PentaParty, you will be taken to the Login page. To create an account, click the "sign up" button, which will redirect you to the Sign Up page.
2. Enter an email, username, and password, then click the "sign up" button.
    - For testing purposes, the email does not need to be real (you could, for example, use something like test01@gmail.com).
    - A password must be at least 6 characters long.
3. Afterwards, you will be redirected back to the log in page.

### Logging In
1. If you have created an account following the steps above, simply enter your credentials and click "Log In".
2. Alternatively, you can log in with a Google account by clicking the "Sign in with Google" button.
3. After either of the above login methods, you will be redirected to the Home page.

### Friends
From the Home page, click on the "Friends" button to go to the Friends page.

To add a friend, go to the "Add Friend" tab. Enter the email of the user you would like to add as a friend, then click the "Send Request" button.

To accept or deny a friend request, go to the "Pending Friends" tab and click the corresponding button.

To view your friends list, go to the "Friends List" tab. To remove a friend, click the "Remove" button by their name.

### Game Lobbies
In order to play PentaParty, a lobby must first be created. 
1. From the Home page, click the "Create Lobby" button.
   This will create a new lobby and redirect you to the Lobby page.
   The player who creates the lobby will be considered the host.
2. To invite other players to the lobby, either:
   - Give them your room code, displayed at the top of the Lobby page.
   - Invite friends via the "Invite" button in the bottom left of the page.
3. To join a lobby, users can click the "Join Lobby" button on the home page, where they can either enter the room code, or accept/deny a lobby invite from a friend.
4. Users can choose between playing as a player or a spectator. To start a game, there must be at least one player and one spectator. A lobby supports up to 4 players and 20 spectators.
5. To start the game, the host can click the "Start" button.

### Playing the Game
#### Players
The goal of the player is to maneuver the shapes that are falling on their board to complete rows of blocks, which contributes points towards their score.

Keyboard Controls: 
(note: the following inputs work after they key is pressed down, then released, i.e. on key up)
- Moving the shape left and right: `a` and `d`
- Moving the shape down: `s`
  - The shapes fall down on their own, but repeatedly pressing this button can make them fall faster
- Clockwise and counter-clockwise rotation: `l` and `j`

#### Spectators
The goal of the spectator is the create custom shapes that will fall on an assigned player's board.

To create a custom shape, spectators click on blocks within a 5x5 grid. They are allowed to select up to 5 contiguous blocks.

Spectators have a certain time frame to create a valid shape. Once their timer finishes, the shape is sent to their assigned player's board.

### Running Tests
1. In the root project directory, run the command `npm test`.
2. Then, press `a` on your keyboard to run all tests.
3. To quit, press `q`.
