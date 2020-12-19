const db = require("../models");

module.exports = (io, games, cardsPerPlayer, scoreToWin) => {

    io.on('connection', (socket) => {

        io.to(socket.id).emit('setupPhase');

        //When user hits index.html
        socket.on('newUser', () => {
            socket.join(roomNum);

            updateGame(socket);


            console.log(`a user connected to room ${roomNum}`);

            io.to(roomNum).emit('roomInfo', roomNum);
        });


        socket.on('disconnecting', () => {
            console.log("User Disconnecting");

            const socketRoom = Array.from(socket.rooms)[1];
            const gameIndex = getGameIndex(socketRoom);
            const game = games[gameIndex];

            removePlayerEntry(games[getGameIndex(socketRoom)], socket.id);

            checkEmptyGames(game, gameIndex);
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
            console.log(`Deal phase sent to room ${roomNum.room}`);

            io.to(roomNum.room).emit('drawPhase');
            setInterviewerDisplay(roomNum.room);
            resetHasInterviewed(games[getGameIndex(roomNum.room)]);
            changeInterviewee(roomNum.room);
            dealPhraseCards(roomNum);
            dealJobCard(roomNum);

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

            io.to(roomNum).emit('employmentPhase', games[getGameIndex(roomNum)].players);

        });

        socket.on('nameAssignment', data => {
            const gameIndex = getGameIndex(data.room);
            const playerIndex = games[gameIndex].players.findIndex(player => player.socketId == socket.id);
            const player = games[gameIndex].players[playerIndex];
            player.name = data.name;

        });

        socket.on('updateInterviewee', roomNum => {
            console.log('Updating Interviewee')
            changeInterviewee(roomNum);
        });

        socket.on('endEmploymentPhase', roomNum => {
            io.to(roomNum).emit('endEmploymentPhase');
        });

        socket.on('assignPoint', data => {
            const game = games[getGameIndex(data.room)];
            game.players.forEach(player => {
                if (player.name == data.winner) {
                    player.points++;
                    io.to(player.socketId).emit('increaseScore');
                };
            });
            checkForWinner(game);
        });
    });

    const checkIfRoomExists = (room) => {
        let roomExists = false;
        games.forEach(game => {
            if (game.room == room) {
                roomExists = true;
            }
        });
        return (roomExists);
    };

    const updateGame = (socket) => {

        if (!checkIfRoomExists(roomNum)) {
            const newPlayer = {
                socketId: socket.id,
                name: '',
                interviewer: true,
                interviewee: false,
                hasInterviewed: false,
                points: 0
            };
            io.to(newPlayer.socketId).emit('toggleInterviewer');

            games.push({
                room: roomNum,
                players: [newPlayer],
                jobCards: [],
                phraseCards: []
            });

        } else {
            const newPlayer = {
                socketId: socket.id,
                name: '',
                interviewer: false,
                interviewee: false,
                hasInterviewed: false,
                points: 0
            };
            const index = getGameIndex(roomNum);
            games[index].players.push(newPlayer);
        };

    };

    const dealPhraseCards = async (roomNum) => {
        const roomIndex = getGameIndex(roomNum.room);
        const players = games[roomIndex].players;


        let phrases = await getPhraseCards(roomNum.room);

        players.forEach(player => {
            if (!player.interviewer) {
                const cardPack = phrases.slice(0, cardsPerPlayer);
                phrases = phrases.slice(cardsPerPlayer);
                io.to(player.socketId).emit('cardPack', cardPack);
            };
        });

    };


    const getPhraseCards = async (roomNum) => {
        const submittedPhraseCards = await db.phrases.findAll({
            where: {
                roomNum: roomNum
            },
            raw: true,
            attributes: [`content`]
        });

        const phraseCardsRaw = await db.premadePhrases.findAll({});

        let phraseDeck = [];

        //first populate using user submissions
        for (i = 0; i < submittedPhraseCards.length; i++) {
            phraseDeck.push(submittedPhraseCards[i].content);
        };

        //Then fill remaining slots (of 100) with premade content
        for (i = phraseDeck.length; i < 100; i++) {
            phraseDeck.push(phraseCardsRaw[i].content);
        };

        shuffle(phraseDeck);
        return phraseDeck;
    };

    const shuffle = (a) => {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        };
    };

    const getJobCards = async () => {
        const submittedJobCards = await db.jobs.findAll({
            where: {
                roomNum: roomNum
            },
            raw: true,
            attributes: [`title`]
        });

        const jobCardsRaw = await db.premadeJobs.findAll({});

        let jobsDeck = [];

        for (i = 0; i < submittedJobCards.length; i++) {
            jobsDeck.push(submittedJobCards[i].title);
        };

        for (i = jobsDeck.length; i < 20; i++) {
            jobsDeck.push(jobCardsRaw[i].title);
        };

        shuffle(jobsDeck);
        return (jobsDeck);
    };

    const dealJobCard = async (roomNum) => {
        let jobs = await getJobCards();
        const cardPack = jobs[0];
        jobs = jobs.slice(1);

        io.to(roomNum.room).emit('dealJobCard', cardPack);
    };

    const getGameIndex = (roomNum) => {
        return games.findIndex(game => game.room == roomNum);
    };

    const changeInterviewee = (roomNum) => {
        const game = games[getGameIndex(roomNum)];
        let newIntervieweeIndex = -1;
        newIntervieweeIndex = chooseNextInterviewee(roomNum);

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
    };
    const chooseNextInterviewee = (roomNum) => {
        const game = games[getGameIndex(roomNum)];
        const availablePlayers = game.players.filter(player => !player.hasInterviewed && !player.interviewer);
        console.log(availablePlayers);

        if (availablePlayers.length > 0) {
            const newIntervieweeRaw = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
            // Index of the chosen player in the original game object
            return game.players.findIndex(player => player.socketId == newIntervieweeRaw.socketId);
        } else {
            console.log('Starting employment Phase');
            io.to(roomNum).emit('employmentPhase', games[getGameIndex(roomNum)].players)
            return -1;
        };
    };

    const removePlayerEntry = (game, socketId) => {
        if (game) {
            console.log(`removed player from room ${game.room}`);
            const playerIndex = game.players.findIndex(player => { player.socketId == socketId });
            game.players.splice(playerIndex, 1);
        };
    };

    const checkEmptyGames = (game, gameIndex) => {
        if (game) {
            if (game.players.length < 1) {
                console.log(`Removed game ${gameIndex} from games array`);
                games.splice(gameIndex, 1);
            };
        }

    };

    const resetHasInterviewed = (game) => {
        game.players.forEach(player => player.hasInterviewed = false);
    };

    const checkForWinner = (game) => {
        let winnerExists = false;
        let winner = '';

        if (game) {
            game.players.forEach(player => {
                console.log(player.points);
                console.log(scoreToWin);
                if (player.points >= scoreToWin) {
                    winnerExists = true;
                    winner = player.name;
                    // ToDo What happens when someone wins?
                    console.log(`${winner} Wins!`);
                };
            });
        };
    };

    const setInterviewerDisplay = (roomNum) => {
        const game = games[getGameIndex(roomNum)];
        let interviewerName = '';
        game.players.forEach(player => {
            if(player.interviewer) {
                interviewerName = player.name;
            }

            console.log('Interviewer: ', interviewerName);

            if(interviewerName != '') {
                io.emit('setCurrentInterviewer', interviewerName);
            }
        })
    }

};