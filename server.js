const {
  Console
} = require("console");
const express = require("express");
const app = express();
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
const PORT = process.env.PORT || 8080;

const cardsPerPlayer = 5;
const scoreToWin = 2;

const games = [
    {
        room: '9999',
        players: [
            {
                name: 'sample',
                socketId: "gfds8d6fg9ddfs",
                interviewer: true,
                interviewee: false,
                hasInterviewed: false,
                points: 0
            }
        ],
        jobCards: [],
        phraseCards: []
    }

];

//socket.io setup
const http = require('http').createServer(app);
const io = require("socket.io")(http);

var db = require("./models");

let roomNum = 9999;

//default front-end folder
app.use(express.static('public'));

require('./routes/api-routes')(app, games);

require('./routes/socket-events')(io, games, cardsPerPlayer, scoreToWin);

db.sequelize.sync({
  force: false
}).then(function () {
  http.listen(PORT, () => {
    console.log("Listening on port 8080");
  });
});