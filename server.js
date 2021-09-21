const express = require("express");
const compression = require("compression");

const app = express();
app.use(compression());
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
const PORT = process.env.PORT || 8080;

const cardsPerPlayer = 5;
const scoreToWin = 2;

const games = [];

//socket.io setup
const http = require('http').createServer(app);
const io = require("socket.io")(http);

var db = require("./models");

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