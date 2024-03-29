const db = require("../models");
const path = require("path");
const rooms = require("../Utils/rooms");

module.exports = (app, games) => {
  //serve html on / request
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/landing.html"));
  });

  app.get('/host', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/index.html'));
    roomNum = rooms.generateRoomNum(games);
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
  app.post("/api/jobs", function (req, res) {
    db.jobs.create(req.body).then(function (dbJob) {
      res.json(dbJob);
    });
  });

  // make a phrase card
  app.post("/api/phrases", function (req, res) {
    db.phrases.create(req.body).then(function (dbPhrase) {
      res.json(dbPhrase);
    });
  });

  // get all premadeJob cards
  app.get("/api/premadeJobs", function (req, res) {
    db.premadeJobs.findAll({}).then(function (dbPreJob) {
      res.json(dbPreJob);
    });
  });

  // get all premadePhrase cards
  app.get("/api/premadePhrases", function (req, res) {
    db.premadePhrases.findAll({}).then(function (dbPrePhrases) {
      res.json(dbPrePhrases);
    });
  });
};