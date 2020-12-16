//Express server setup
const express = require("express");
const app = express();
const db = require("./models");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const PORT = process.env.PORT || 8080;

const cardsPerPlayer = 5;

const games = [
  {
    room: "9999",
    players: [
      {
        name: "sample",
        socketId: "gfds8d6fg9ddfs",
        interviewer: true
      }
    ]
  }
];

//socket.io setup
const http = require("http").createServer(app);
const io = require("socket.io")(http);

//default front-end folder
app.use(express.static("public"));

// let roomNum = "9999";

require("./routes/api-routes")(app);

require("./routes/socket-events")(io, games, cardsPerPlayer);

db.sequelize.sync({ force: false }).then(() => {
  http.listen(PORT, () => {
    console.log("Listening on port 8080");
  });
});
