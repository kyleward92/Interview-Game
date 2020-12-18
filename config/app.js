const gameData = {
  phase: "setup",
  roundNumber: 1,
  jobDeck: [],
  resumeDeck: []
};

class Player {
  constructor(name, gameId) {
    this.name = name;
    this.gameId = gameId;
  }
}

(module.exports = Player), gameData;
