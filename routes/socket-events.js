module.exports = (io, games) => {

   


    io.on('connection', (socket) => {

        socket.join(roomNum);

        updateGame(socket);

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

        socket.on('nextPhase', data => {
            const newPhase = nextPhase(parseInt(data.phase));
            console.log('Phase Advanced');
            io.to(data.room).emit('nextPhase', { newPhase: newPhase });
        });

        socket.on('cardClicked', cardData => {
            console.log('Card Clicked: ', cardData.text);
            io.to(cardData.room).emit('cardClicked', cardData);
        });

        //event listener for handling the setup phase
        socket.on('setupPhase', roomNum => {
            console.log(`Submission phase sent to room ${roomNum.room}`);
            io.to(roomNum.room).emit('setupPhase');

        });

        //event listener for handling the draw phase
        socket.on('drawPhase', roomNum => {
            console.log(`Deal phase sent to room ${roomNum.room}`);
            io.to(roomNum.room).emit('drawPhase');

        });

        //event listener for handling the interview phase
        socket.on('interviewPhase', roomNum => {
            console.log(`Interview phase sent to room ${roomNum.room}`);
            io.to(roomNum.room).emit('interviewPhase');

        });

        //event listener for handling the employment phase
        socket.on('employmentPhase', roomNum => {
            console.log(`Employment phase sent to room ${roomNum.room}`);
            io.to(roomNum.room).emit('emloymentPhase');

        });
    });

    const checkIfRoomExists = (room) => {
        let roomExists = false;
        games.forEach(game => {
            if(game.room == room) {
                roomExists = true;
            }
        })
        return(roomExists);
    }

    const updateGame = (socket) => {
        const newPlayer = {socketId: socket.id};

        if (!checkIfRoomExists(roomNum)) {
            games.push(
                {
                    room: roomNum,
                    players: [newPlayer]
                }
            );
        } else {
            const index = games.findIndex(game => game.room == roomNum);
            games[index].players.push(newPlayer);
        }
    }
}