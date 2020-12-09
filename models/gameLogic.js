//Timer
const Timer = require("tiny-timer");


//Player Data
const one = { name: "Player One", role: "interviewer" };
const two = { name: "Player Two", role: "applicant" };

const Players = [one, two]

// module.exports = (RoomId, Players) => {

//Timer Setup code
const timer = new Timer();
timer.on('tick', (ms) => console.log('tick', ms))
timer.on('done', () => console.log('done!', Players))

//This can be used to emit the event for round changes
timer.on('statusChanged', (status) =>
    console.log('status:', status,))

timer.start(5000) // run for 5 seconds
