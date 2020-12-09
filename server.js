//Express server setup
const express = require("express");
const app = express();

//socket.io setup
const http = require('http').createServer(app);
const io = require("socket.io")(http);

const path = require('path');

//default front-end folder
app.use(express.static('Assets'));

const PORT = 8080;

let roomNum = '9999';

//serve html on / request
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/html/landing.html'));
});

app.get('/host', (req, res) => {
    res.sendFile(path.join(__dirname, './public/html/index.html'));
    roomNum = Math.floor(Math.random() * 9999).toString();
});

app.get('/join/:roomNumber', (req,res) => {
    res.sendFile(path.join(__dirname, './public/html/index.html'));
    console.log('Params Val: ', req.params.roomNumber);
    roomNum = req.params.roomNumber;
    console.log('Room Number: ', roomNum);
});


//socket events 
//When socket from front-end connects
io.on('connection', (socket) => {
    
    socket.join(roomNum);
    console.log(`a user connected to room ${roomNum}`);

    io.to(roomNum).emit('roomInfo', roomNum);

    //when socket disconnects
    socket.on('disconnect', () => {
        console.log("User Disconnected");
    });

    //listen for custom event 'chat' from front end socket
    socket.on('chat', (msg) => {
        console.log(`${msg.author}: ${msg.message}`);
        //send the message received from one user to all other users
        io.to(msg.room).emit('chat', msg);

    });

});


http.listen(PORT, () => {
    console.log("Listening on port 8080");
});