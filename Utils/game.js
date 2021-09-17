const Game = (io, games, utils, cardsPerPlayer, scoreToWin) => {
    

    const Game = {
        updatePlayerList: roomNum => {
            const game = games[utils.getGameIndex(roomNum)];
            io.to(roomNum).emit('UpdatePlayerList', game.players);
        },

        toggleReady: ({ room, userName },) => {
            const gameIndex = utils.getGameIndex(room);
            const playerIndex = games[gameIndex].players.findIndex(player => player.name == userName);

            games[gameIndex].players[playerIndex].ready = !games[gameIndex].players[playerIndex].ready;

            const readyPlayers = games[gameIndex].players.filter(player => player.ready == true);

            if (readyPlayers.length == games[gameIndex].players.length && games[gameIndex].canStart == false && games[gameIndex].players.length > 1) {
                games[gameIndex].canStart = true;
                io.to(roomNum).emit('toggleAllowStart');
            };

            if (readyPlayers.length < games[gameIndex].players.length && games[gameIndex].canStart == true) {
                games[gameIndex].canStart = false;
                io.to(roomNum).emit('toggleAllowStart');
            };

            Game.updatePlayerList(room);
        },

        dealPhraseCards: async (roomNum) => {
            const roomIndex = utils.getGameIndex(roomNum.room);
            const players = games[roomIndex].players;


            let phrases = await utils.getPhraseCards(roomNum.room);

            players.forEach(player => {
                if (!player.interviewer) {
                    const cardPack = phrases.slice(0, cardsPerPlayer);
                    phrases = phrases.slice(cardsPerPlayer);
                    io.to(player.socketId).emit('cardPack', cardPack);
                };
            });
        },

        dealJobCard: async (roomNum) => {
            let jobs = await utils.getJobCards();
            const cardPack = jobs[0];
            jobs = jobs.slice(1);

            io.to(roomNum.room).emit('dealJobCard', cardPack);
        },

        chooseNextInterviewee: (roomNum) => {
            const game = games[utils.getGameIndex(roomNum)];
            const availablePlayers = game.players.filter(player => !player.hasInterviewed && !player.interviewer);

            if (availablePlayers.length > 0) {
                const newIntervieweeRaw = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
                return game.players.findIndex(player => player.socketId == newIntervieweeRaw.socketId);
            } else {
                io.to(roomNum).emit('employmentPhase', games[utils.getGameIndex(roomNum)].players)
                return -1;
            };
        },

        changeInterviewee: (roomNum) => {
            const game = games[utils.getGameIndex(roomNum)];
            let newIntervieweeIndex = -1;
            newIntervieweeIndex = Game.chooseNextInterviewee(roomNum);

            if (newIntervieweeIndex != -1) {
                const newInterviewee = game.players[newIntervieweeIndex];

                game.players.forEach(player => {
                    player.interviewee = false;
                });
                newInterviewee.interviewee = true;
                newInterviewee.hasInterviewed = true;
                io.to(roomNum).emit('setCurrentPlayer', newInterviewee);
                io.to(roomNum).emit('interviewPhase');
            };
        },

        nextInterviewer: (roomNum) => {
            const game = games[utils.getGameIndex(roomNum)];
            // Toggle interviewerStatus of the current interviewer (to false) on both client and server
            io.to(game.players[game.interviewerIndex].socketId).emit('toggleInterviewer');
            game.players[game.interviewerIndex].interviewer = false;

            game.interviewerIndex += 1

            if (game.interviewerIndex >= game.players.length) {
                game.interviewerIndex = 0;
            };

            // Toggle interviewerStatus of the new interviewer (to true) on both client and server
            io.to(game.players[game.interviewerIndex].socketId).emit('toggleInterviewer');
            game.players[game.interviewerIndex].interviewer = true;

            io.to(roomNum).emit('setCurrentInterviewer', game.players[game.interviewerIndex].name);
        },

        resetHasInterviewed: (game) => {
            game.players.forEach(player => player.hasInterviewed = false);
        },

        checkForWinner: (game) => {
            let winnerExists = false;
            let winner = '';
    
            if (game) {
                game.players.forEach(player => {
                    if (player.points >= scoreToWin) {
                        winnerExists = true;
                        winner = player.name;
                        // ToDo What happens when someone wins?
                        console.log(`${winner} Wins!`);
                    };
                });
            };
        },

        setInterviewerDisplay: (roomNum) => {
            const game = games[utils.getGameIndex(roomNum)];
            let interviewerName = '';
            game.players.forEach(player => {
                if(player.interviewer) {
                    interviewerName = player.name;
                };
    
                if(interviewerName != '') {
                    io.emit('setCurrentInterviewer', interviewerName);
                };
            });
        }
    };

    return Game;
};

module.exports = Game;