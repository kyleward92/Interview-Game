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
            const gameIndex = utils.getGameIndex(roomNum);
            const phraseCardsRaw = await db.premadePhrases.findAll({});
            const phraseCards = phraseCardsRaw.map(card => card.content);

            let phraseDeck = [...games[gameIndex].phraseCards, ...phraseCards];
    
            utils.shuffle(phraseDeck);
            games[gameIndex].phraseCards = phraseDeck;
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

        getJobCards: async (roomNum) => {
            const gameIndex = utils.getGameIndex(roomNum);
            const jobCardsRaw = await db.premadeJobs.findAll({});
            const jobCards = jobCardsRaw.map(card => card.title);

            let jobDeck = [...games[gameIndex].jobCards, ...jobCards];
    
            utils.shuffle(jobDeck);
            games[gameIndex].jobCards = jobDeck;
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