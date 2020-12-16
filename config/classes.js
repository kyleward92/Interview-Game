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
  constructor(name, gameId, socketId) {
    name;
    gameId;
    socketId;
    this.score = 0;
  }
}

(module.exports = GameData), Player;
