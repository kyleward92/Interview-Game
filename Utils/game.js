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

        dealPhraseCards: (roomNum) => {
            const gameIndex = utils.getGameIndex(roomNum);
            const players = games[gameIndex].players;

            players.forEach(player => {
                if (!player.interviewer) {
                    const cardPack = games[gameIndex].phraseCards.slice(0, cardsPerPlayer);
                    games[gameIndex].phraseCards = games[gameIndex].phraseCards.slice(cardsPerPlayer);
                    io.to(player.socketId).emit('cardPack', cardPack);
                };
            });
        },

        dealJobCard: (roomNum) => {
            const gameIndex = utils.getGameIndex(roomNum);

            const card = games[gameIndex].jobCards[0];
            games[gameIndex].jobCards = games[gameIndex].jobCards.slice(1);

            console.log(card);
            io.to(roomNum).emit('dealJobCard', card);
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

        resetPoints: game => {
            game.players.forEach(player => player.points = 0);
        },

        checkForWinner: (game) => {
            let winner;
            game.players.forEach(player => {
                if (player.points >= scoreToWin) {
                    winner = player.name;
                    console.log(`${winner} Wins!`);
                };
            });
            return winner;
        },

        setInterviewerDisplay: (roomNum) => {
            const game = games[utils.getGameIndex(roomNum)];
            let interviewerName = '';
            game.players.forEach(player => {
                if (player.interviewer) {
                    interviewerName = player.name;
                };

                if (interviewerName != '') {
                    io.emit('setCurrentInterviewer', interviewerName);
                };
            });
        },

        nextRound: (room) => {
            console.log(`Draw phase sent to room ${room}`);

            io.to(room).emit('drawPhase');
            Game.setInterviewerDisplay(room);
            Game.resetHasInterviewed(games[utils.getGameIndex(room)]);
            Game.changeInterviewee(room);
            Game.dealPhraseCards(room);
            Game.dealJobCard(room);

            console.log(`Interview phase sent to room ${room}`);
            io.to(room).emit('interviewPhase');
        },

        submissionPhaseSetup: room => {
            const gameIndex = utils.getGameIndex(room);

            console.log(`Submission phase sent to room ${room}`);
            utils.resetPlayerReady(room);

            const data = {
                players: games[gameIndex].players
            };

            io.to(room).emit('submissionPhase', data);
        },

        resetGame: ({ room, newCards }) => {
            const gameIndex = utils.getGameIndex(room);
            const game = games[gameIndex];

            Game.resetPoints(game);

            if (newCards) {
                game.jobCards = [];
                game.phraseCards = [];

                game.jobCardsOrig = [];
                game.phraseCardsOrig = [];

                Game.submissionPhaseSetup(room);
            } else {
                game.jobCards = game.jobCardsOrig;
                game.phraseCards = game.phraseCardsOrig;

                io.to(roomNum).emit("endSubmissionPhase");
            }
        }
    };

    return Game;
};

module.exports = Game;