//Express server setup
const { Console } = require("console");
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const PORT = process.env.PORT || 8080;


//socket.io setup
const http = require('http').createServer(app);
const io = require("socket.io")(http);

const redis = require('socket.io-redis');
io.adapter(redis({ host: 'localhost', port: 6379 }));

var db = require("./models");

let roomNum = 9999;

//default front-end folder
app.use(express.static('public'));

require('./routes/api-routes')(app);

require('./routes/socket-events')(io);

require('./config/app.js');

db.sequelize.sync({ force: true }).then(function () {
    http.listen(PORT, () => {
        console.log("Listening on port 8080");
    });
});


const NumClientsInRoom = (room) => {
    var clients = io.nsps['/'].adapter.rooms[room];
    return Object.keys(clients).length;
};

