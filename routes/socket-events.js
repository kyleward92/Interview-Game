const db = require("../models");

module.exports = (io, games, cardsPerPlayer, scoreToWin) => {
    const utils = require("../Utils/utils")(io, games, db);
    const Game = require("../Utils/game")(io, games, utils, cardsPerPlayer, scoreToWin);  

    io.on('connection', (socket) => {

        io.to(socket.id).emit('setupPhase');

        //When user hits index.html
        socket.on('newUser', () => {
            socket.join(roomNum);
            utils.updateGame(socket);

            console.log(`a user connected to room ${roomNum}`);

            io.to(roomNum).emit('roomInfo', roomNum);
        });

        socket.on('disconnecting', () => {
            console.log("User Disconnecting");

            const socketRoom = Array.from(socket.rooms)[1];
            const gameIndex = utils.getGameIndex(socketRoom);
            const game = games[gameIndex];

            utils.removePlayerEntry(games[utils.getGameIndex(socketRoom)], socket.id);

            utils.checkEmptyGames(game, gameIndex);
        });

        //when socket disconnects
        socket.on('disconnect', () => {
            console.log("User Disconnected");
        });

        socket.on('reconnect', () => {
            console.log(`User ${socket.id} reconnecting...`);
        });

        //listen for custom event 'chat' from front end socket
        socket.on('chat', (msg) => {
            console.log(`${msg.author}: ${msg.message}`);
            //send the message received from one user to all other users
            io.to(msg.room).emit('chat', msg);
        });

        socket.on('nextPhase', data => {
            const newPhase = nextPhase(parseInt(data.phase));
            io.to(data.room).emit('nextPhase', {
                newPhase: newPhase
            });
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
            console.log(`Draw phase sent to room ${roomNum.room}`);

            io.to(roomNum.room).emit('drawPhase');
            Game.setInterviewerDisplay(roomNum.room);
            Game.resetHasInterviewed(games[utils.getGameIndex(roomNum.room)]);
            Game.changeInterviewee(roomNum.room);
            Game.dealPhraseCards(roomNum);
            Game.dealJobCard(roomNum);

            io.to(roomNum.room).emit('interviewPhase');

            console.log(`Interview phase sent to room ${roomNum.room}`);
        });

        //event listener for handling the interview phase
        socket.on('interviewPhase', roomNum => {
            console.log(`Interview phase sent to room ${roomNum.room}`);
            io.to(roomNum.room).emit('interviewPhase');
        });

        //event listener for handling the employment phase
        socket.on('employmentPhase', roomNum => {
            console.log(`Employment phase sent to room ${roomNum}`);

            io.to(roomNum).emit('employmentPhase', games[utils.getGameIndex(roomNum)].players);

        });

        socket.on('nameAssignment', data => {
            const gameIndex = utils.getGameIndex(data.room);
            const playerIndex = games[gameIndex].players.findIndex(player => player.socketId == socket.id);
            const player = games[gameIndex].players[playerIndex];
            player.name = data.name;

            io.to(data.room).emit("UpdatePlayerList", games[gameIndex].players);
        });

        socket.on('toggleReady', (data) => {
            Game.toggleReady(data);
        });

        socket.on('updateInterviewee', roomNum => {
            console.log('Updating Interviewee')
            Game.changeInterviewee(roomNum);
        });

        socket.on('endEmploymentPhase', roomNum => {
            io.to(roomNum).emit('endEmploymentPhase');
            Game.nextInterviewer(roomNum);
        });

        socket.on('assignPoint', data => {
            const game = games[utils.getGameIndex(data.room)];
            game.players.forEach(player => {
                if (player.name == data.winner) {
                    player.points++;
                    io.to(player.socketId).emit('increaseScore');
                };
            });
            Game.checkForWinner(game);
        });
    });
};