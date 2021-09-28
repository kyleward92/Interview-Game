const utils = (io, games, db) => {
    const utils = {
        checkIfRoomExists: (room) => {
            let roomExists = false;
            games.forEach(game => {
                if (game.room == room) {
                    roomExists = true;
                }
            });
            return (roomExists);
        },

        updateGame: (socket) => {
            if (!utils.checkIfRoomExists(roomNum)) {
                const newPlayer = {
                    socketId: socket.id,
                    name: '',
                    interviewer: true,
                    interviewee: false,
                    hasInterviewed: false,
                    ready: false,
                    points: 0
                };
                io.to(newPlayer.socketId).emit('toggleInterviewer');
    
                games.push({
                    room: roomNum,
                    players: [newPlayer],
                    interviewerIndex: 0,
                    jobCards: [],
                    phraseCards: [],
                    canStart: false
                });
    
            } else {
                const newPlayer = {
                    socketId: socket.id,
                    name: '',
                    interviewer: false,
                    interviewee: false,
                    hasInterviewed: false,
                    ready: false,
                    points: 0
                };
                const index = utils.getGameIndex(roomNum);
                games[index].players.push(newPlayer);
            };
        },

        getPhraseCards: async (roomNum) => {
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
    
            utils.shuffle(phraseDeck);
            return phraseDeck;
        },

        shuffle: (a) => {
            var j, x, i;
            for (i = a.length - 1; i > 0; i--) {
                j = Math.floor(Math.random() * (i + 1));
                x = a[i];
                a[i] = a[j];
                a[j] = x;
            };
        },

        getJobCards: async () => {
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
    
            utils.shuffle(jobsDeck);
            return (jobsDeck);
        },

        getGameIndex: (roomNum) => {
            return games.findIndex(game => game.room == roomNum);
        },

        removePlayerEntry: (game, socketId) => {
            if (game) {
                const playerIndex = game.players.findIndex(player => { player.socketId == socketId });
                game.players.splice(playerIndex, 1);
                console.log(`removed player from room ${game.room}`);
            };
        },

        checkEmptyGames: (game, gameIndex) => {
            if (game) {
                if (game.players.length < 1) {
                    console.log(`Removed game ${gameIndex} from games array`);
                    games.splice(gameIndex, 1);
                };
            };
        },

        resetPlayerReady: room => {
            const gameIndex = utils.getGameIndex(room);
            games[gameIndex].players.forEach(player => player.ready = false);
        }
    };


    return utils;
};

module.exports = utils;