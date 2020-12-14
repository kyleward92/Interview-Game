//Express server setup
const { Console } = require("console");
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const PORT = process.env.PORT || 8080;

const games = [
    {
        room: '9999',
        players: [
            {
                playerName: "dingus",
                socketId: "gfds8d6fg9ddfs"
            }
        ]
    }

];

//socket.io setup
const http = require('http').createServer(app);
const io = require("socket.io")(http);

var db = require("./models");


//default front-end folder
app.use(express.static('public'));

let roomNum = '9999';

require('./routes/api-routes')(app);

require('./routes/socket-events')(io, games);

db.sequelize.sync({ force: false }).then(function () {
    http.listen(PORT, () => {
        console.log("Listening on port 8080");
    });
});


