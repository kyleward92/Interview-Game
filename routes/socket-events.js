const db = require("../models");

module.exports = (io, games, cardsPerPlayer) => {
  io.on("connection", (socket) => {
    socket.join(roomNum);

    updateGame(socket);
    console.log(games);

    console.log(`a user connected to room ${roomNum}`);

    io.to(roomNum).emit("roomInfo", roomNum);

    //when socket disconnects
    socket.on("disconnect", () => {
      console.log("User Disconnected");
    });

    //listen for custom event 'chat' from front end socket
    socket.on("chat", (msg) => {
      console.log(`${msg.author}: ${msg.message}`);
      //send the message received from one user to all other users
      io.to(msg.room).emit("chat", msg);
    });

    socket.on("nextPhase", (data) => {
      const newPhase = nextPhase(parseInt(data.phase));
      io.to(data.room).emit("nextPhase", { newPhase: newPhase });
    });

    socket.on("cardClicked", (cardData) => {
      console.log("Card Clicked: ", cardData.text);
      io.to(cardData.room).emit("cardClicked", cardData);
    });

    //event listener for handling the setup phase
    socket.on("setupPhase", (roomNum) => {
      console.log(`Submission phase sent to room ${roomNum.room}`);
      io.to(roomNum.room).emit("setupPhase");
    });

    //event listener for handling the draw phase
    socket.on("drawPhase", (roomNum) => {
      console.log(`Deal phase sent to room ${roomNum.room}`);
      io.to(roomNum.room).emit("drawPhase");
      dealPhraseCards(roomNum);
      dealJobCard(roomNum);
      io.to(roomNum.room).emit("interviewPhase");
      console.log(`Interview phase sent to room ${roomNum.room}`);
    });

    //event listener for handling the interview phase
    socket.on("interviewPhase", (roomNum) => {
      console.log(`Interview phase sent to room ${roomNum.room}`);
      io.to(roomNum.room).emit("interviewPhase");
    });

    //event listener for handling the employment phase
    socket.on("employmentPhase", (roomNum) => {
      console.log(`Employment phase sent to room ${roomNum}`);

      io.to(roomNum).emit(
        "employmentPhase",
        games[games.findIndex((game) => game.room == roomNum)].players
      );
    });

    socket.on("nameAssignment", (data) => {
      const gameIndex = games.findIndex((game) => game.room == data.room);
      const playerIndex = games[gameIndex].players.findIndex(
        (player) => player.socketId == socket.id
      );
      games[gameIndex].players[playerIndex].name = data.name;
      console.log(games[gameIndex].players);
    });
  });

  const checkIfRoomExists = (room) => {
    let roomExists = false;
    games.forEach((game) => {
      if (game.room == room) {
        roomExists = true;
      }
    });
    return roomExists;
  };

  const updateGame = (socket) => {
    if (!checkIfRoomExists(roomNum)) {
      const newPlayer = { socketId: socket.id, name: "", interviewer: true };
      io.to(newPlayer.socketId).emit("toggleInterviewer");

      games.push({
        room: roomNum,
        players: [newPlayer],
      });
    } else {
      const newPlayer = { socketId: socket.id, name: "", interviewer: false };
      const index = games.findIndex((game) => game.room == roomNum);
      games[index].players.push(newPlayer);
    }
  };

  const dealPhraseCards = async (roomNum) => {
    const roomIndex = games.findIndex((game) => game.room == roomNum.room);
    const players = games[roomIndex].players;

    const cardsNeeded = (players.length - 1) * cardsPerPlayer;

    let phrases = await getPhraseCards();

    players.forEach((player) => {
      if (!player.interviewer) {
        const cardPack = phrases.slice(0, cardsPerPlayer);
        phrases = phrases.slice(cardsPerPlayer);
        io.to(player.socketId).emit("cardPack", cardPack);
      }
    });
  };

  const getPhraseCards = async () => {
    const phraseCardsRaw = await db.premadePhrases.findAll({});

    var phraseDeck = [];
    for (i = 0; i < phraseCardsRaw.length; i++) {
      phraseDeck.push(phraseCardsRaw[i].content);
    }
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
    }
  };

  const getJobCards = async () => {
    const jobCardsRaw = await db.premadeJobs.findAll({});

    let jobsDeck = [];
    for (i = 0; i < jobCardsRaw.length; i++) {
      jobsDeck.push(jobCardsRaw[i].title);
    }
    shuffle(jobsDeck);
    return jobsDeck;
  };

  const dealJobCard = async (roomNum) => {
    let jobs = await getJobCards();
    const cardPack = jobs[0];
    jobs = jobs.slice(1);

    io.to(roomNum.room).emit("dealJobCard", cardPack);
  };
};
