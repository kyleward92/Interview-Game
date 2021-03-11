# Interview Game [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

### Table of Contents
* [Description](#Description)
* [Installation](#Installation)
* [Usage](#Usage)
* [Technologies](#Technologies)
* [Contributors](#Contributors)
* [Contribution](#Contribution)
---

### Description <a name="Description"></a>
The Interview Game is a website that allows group of users to play amongst each other as an Interviewer or a Interviewee. The website offers players to host or join a current lobby alongside with a discord widget that allows for players to jump into channels to simulate a better experience. The game works with one player being the Interviewer for one round while the other players are Interviewees which all have 5 cards that they must use to win over the Interviewer for the current job card.

---

### Installation <a name="Installation"></a>

To begin, clone the repo onto your local machine.

Now that you have the files on the local machine you'll need the node module dependencies. So in the terminal of your choice run the command

```
npm i
```

The next step will require you to have mySQL installed so that you can seed the db with info. Before that YOU NEED TO go to the config.json file and make sure that the development password matches your mySQL root password. Afterwards you'll need to open up mySQLWorkBench and create the database.

```
CREATE DATABASE interview_db;
```


Now you want to go back to the terminal(make sure you're still in the proper directory) and run the following command:

```
npx sequelize db:seed:all
```

Now you should have new tables with data into them. To host the application locally, use the following command:

```
npm start
```

If you did the previous steps right you should be able to navigate to https://localhost:8080 to pull up The Interview Game!

The Interview Game is also hosted on heroku and can be found [here](https://interview--game.herokuapp.com/)

---
### Usage <a name="Usage"></a>
Upon your arrival to the landing page, you will see a breif set of instructions, as well as several input boxes and buttons. On the navbar, you will see a Learn how to play link. It is reccomended that if you have never played you review this page. On the landing page there are several options. First, you should fill out the display name input box. This is how you will show up to other players during the game. Once you have decided on your display name, you can click the host room button to create a new room. If you have a friend that has already created a room, you can enter the room code in the room number input and click join room. 

You will now arrive on the game page. Once all players have joined, One player can press the start button to begin the game for all players (It is important that all players join before the game is started in the current version, or the game will break for some players. This will be fixed in a later update). 

Once the game has begun, some key information will be displayed on the screen. You will see a Job name box which shows the current position that is being interviewed for, the interviewer bow that shows the display name of the current interviewer, and the current interviewee box which shows the display name of the person who is currently pitching. The interviewer will remain the same person for each round and will interview every other player. Once each player has finished interviewing, they can end their turn and pass the interview on to the next player. 

If you see your display name in the interviewer box, your job is to listen to all the pitches and ultimately decide who gets the job after everyone has given their pitch. 

If you see your display name in the current interviewee box, it is your job to give your pitch as to why you deserve the job listed in the job name box. Here's the catch: you will also see five phrase buttons displayed on your screen. You must incorporate each of these phrases into your pitch. Whenever you decide to say one of your phrases, you will click the corresponding button. By clicking the button, it will display the phrase to everyone in the room. You can use this to increse the dramatic effect of your pitch! Once you have used all of your cards, you click the end turn button and your role is then passed on to another player. 

Once each player (other than the interviewer) has gone through this process, the interviewer will see a button for each player that interviewed on his or her screen. By clicking the corresponding button of the player who gave their favorite pitch, they assign that player a point.

After this, a new round begins. (At present, the interviewer never changes. This will be addressed in a future update).

You can play to as many points as you like. It's up to your party to decide!

---
### Technologies <a name="Technologies"></a>
- Socket.io
- Node.js
- Express
- CSS
- HTML
- JavaScript
- mySQL
- BootStrap

---
### Contributors <a name="Contributors"></a>
- Brendon Stahl
- Brian Whitman
- Crawford Smith
- Elijah Melanson
- Kyle Ward 
- Akash Patel 

---
### Contribution <a name="Contribution"></a>
If you would like to contribute to the project please open a pull request and we will review the submission.
