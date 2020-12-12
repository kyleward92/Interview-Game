const io = require('../routes/socket-events')
const { GameData, Player } = require('./classes')

module.exports = {
    initGame: (socketIo, currentRoom, socket) => {
        io = socketIo;
        gameSocket = socket;

        //Server Events
        gameSocket.on('serverCreateGame', serverCreateGame);
        gameSocket.on('initPlayers', initPlayers);


        //Player Events
    },


    /* *****************************
       *                           *
       *     SERVER FUNCTIONS
       * Player setup / Game init  *
       *                           *
       ***************************** */


    //Called when room is full.  Creates player objects for gameLogic.
    initPlayers: (room) => {
        console.log("INIT PLAYERS FUNCTION");

        var clients = io.nsps['/'].adapter.rooms[room];
        Object.keys(clients);

        const playerArray = [];

        roomMembers.forEach(player => {
            return new Player(name, room, socketId);
        });

    }

    // initGame = (players, data) => {
    // players
    // }


}