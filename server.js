//Express server setup
const { Console } = require("console");
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


//socket.io setup
const http = require('http').createServer(app);
const io = require("socket.io")(http);


var db = require("./models");

const path = require('path');

//default front-end folder
app.use(express.static('public'));

const PORT = process.env.PORT || 8080;

let roomNum = '9999';

require('./routes/api-routes')(app);

//serve html on / request
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/html/landing.html'));
});

app.get('/host', (req, res) => {
    res.sendFile(path.join(__dirname, './public/html/index.html'));
    roomNum = Math.floor(Math.random() * 9999).toString();
});

app.get('/join/:roomNumber', (req, res) => {
    res.sendFile(path.join(__dirname, './public/html/index.html'));
    roomNum = req.params.roomNumber;
});

//*************
//socket events 
//*************

require('./routes/socket-events');


db.sequelize.sync({ force: true }).then(function () {
    http.listen(PORT, () => {
        console.log("Listening on port 8080");
    });
});


// Handles changing the phase
const nextPhase = (currentPhase) => {
    let newPhase;
    if (currentPhase === 3) {
        newPhase = 1;
    } else {
        newPhase = currentPhase + 1;
    }

    return newPhase;
};

const NumClientsInRoom = (room) => {
    var clients = io.nsps['/'].adapter.rooms[room];
    return Object.keys(clients).length;
  }