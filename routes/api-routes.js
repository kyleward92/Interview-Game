const db = require("../models");
const path = require("path");

module.exports = function (app, games) {
  //serve html on / request
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/landing.html"));
  });

  app.get('/host', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/index.html'));
    roomNum = generateRoomNumber(games);
  });

  app.get("/join/:roomNumber", (req, res) => {
    console.log("joining");
    res.sendFile(path.join(__dirname, "../public/html/index.html"));
    roomNum = req.params.roomNumber;
  });

  app.get("/how-to-play", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/howto_play.html"));
  });

  // make a job card
  app.post("/api/jobs", (req, res) => {
    db.jobs.create(req.body).then(dbJob => {
      res.json(dbJob);
    });
  });

  // make a phrase card
  app.post("/api/phrases", (req, res) => {
    db.phrases.create(req.body).then(dbPhrase => {
      res.json(dbPhrase);
    });
  });

  // get all premadeJob cards
  app.get("/api/premadeJobs", (req, res) => {
    db.premadeJobs.findAll({}).then(dbPreJob => {
      res.json(dbPreJob);
    });
  });

  // get all premadePhrase cards
  app.get("/api/premadePhrases", (req, res) => {
    db.premadePhrases.findAll({}).then(dbPrePhrases => {
      res.json(dbPrePhrases);
    });
  });
};


const generateRoomNumber = (games) => {
  roomNumber = Math.floor(Math.random() * 9999).toString();
  if(checkRoomNum(roomNumber, games)) {
    return roomNumber;
  } else {
    generateRoomNumber(games);
  }
};

const checkRoomNum = (roomNum, games) => {
  let isRoomGood = true;

  games.forEach(game => {
    if(game.room == roomNum) {
      isRoomGood =  false;
    };
  });

  return isRoomGood;

}; 
