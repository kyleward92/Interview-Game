module.exports = (io) => {
    io.on('connection', (socket) => {

        socket.join(roomNum);
        console.log(`a user connected to room ${roomNum}`);

        io.to(roomNum).emit('roomInfo', roomNum);
        io.emit('initPlayers', roomNum);

        //this line is used to test the phase change events
        // io.to(roomNum).emit('employmentPhase', roomNum);

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

        socket.on('nextPhase', data => {
            const newPhase = nextPhase(parseInt(data.phase));
            console.log('Phase Advanced');
            io.to(data.room).emit('nextPhase', { newPhase: newPhase });
        });

        socket.on('cardClicked', cardData => {
            console.log('Card Clicked: ', cardData.text);
            io.to(cardData.room).emit('cardClicked', cardData);
        });


    });
}