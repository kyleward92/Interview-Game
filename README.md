# Interview Game

Interview Games is a website that allows group of users to play amongst each other as an Interviewer or a Interviewee. The website offers players to host or join a current lobby alongside with a discord widget that allows for players to jump into channels to simulate a better experience. The game works with one player being the Interviewer for one round while the other players are Interviewees which all have 5 cards that they must use to win over the Interviewer for the current job card.

## Installing/Running

A step by step series of examples that tell you how to get a development env running

Make sure you're in an appropriate folder that you want to clone the files to and in the terminal run the following comamnd.

```
git clone git@github.com:kyleward92/Interview-Game.git
```

Now that you have the files on the local machine you'll need the node module dependencies. So in the terminal or even better the VS code terminal run the following command. _Make sure you're in the proper directory_

```
npm i
```

The next step will require you to have mySQLWorkBench so that you can seed the db with info. Before that YOU NEED TO go to the config.json file and make sure that the development username and password match your mySQLWorkBench username/password. Afterwards you'll need to open up mySQLWorkBench and run the following.

```
CREATE DATABASE interview_db;
```

```
USE interview_db;
```

Now you should have a db called interview_db and it should be in use. Now you want to go back to the terminal(make sure you're still in the proper directory) and run the following command.

```
npx sequelize db:seed:all
```

Now you should have new tables with data into them and should be ready to deploy. If you do not want to deploy on heroku and want to run the website locally use the following command.

```
node server.js
```

If you did the previous steps right you should be able to go to your web browser and type in localhost:8080 to pull up Interview Games!

## Deployment

Add additional notes about how to deploy this on a live system

## Built With

- [Node.js]
- [Socket.IO]
- [HTML]
- [JavaScript]
- [mySQL]
- [BootStrap]

## Authors

- Brendon Stahl [Github](https://github.com/kyleward92/Interview-Game/tree/Brendon)
- Brian Whitman [Github](https://github.com/kyleward92/Interview-Game/tree/Brian)
- Crawford Smith [Github](https://github.com/kyleward92/Interview-Game/tree/Crawford)
- Elijah Melanson [Github](https://github.com/kyleward92/Interview-Game/tree/Elijah)
- Kyle ward [Github](https://github.com/kyleward92/Interview-Game)
- Akash Patel [Github](https://github.com/kyleward92/Interview-Game/tree/Akash)

## License
