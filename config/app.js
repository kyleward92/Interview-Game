var io;

exports.initGame = (socketIo, currentRoom, socket){
    io = socketIo;
    gameSocket = socket;

    //Server Events
    gameSocket.on('serverCreateGame', serverCreateGame);


    //Player Events

}
class GameData {
    constructor(gameId, phase, roundNumber, jobDeck, resumeDeck) {
        gameId;
        phase;
        roundNumber;
        jobDeck;
        resumeDeck;
    }
}
class Player {
    constructor(name, gameId,) {
        name;
        gameId;
        this.score = 0;
    }
}

/* *****************************
   *                           *
   *     SERVER FUNCTIONS      *
   *                           *
   ***************************** */



// serverPrepareGame(roomNum) {
// }


module.exports = Player, GameData