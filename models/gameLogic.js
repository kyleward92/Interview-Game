//Timer
const Timer = require("tiny-timer");

const gamePhase = "setup";


//Player Data stubs
//TODO call player info from DB
//TODO author Player model

//Player class will have name (from account), SCORE, flags for interviwer and hotseat(next to be interviewer)
const one = { name: "Player One", interviewer: true };
const two = { name: "Player Two", };
const three = { name: "Player Three", hotseat: true };

const playersArray = [one, two, three]

//TODO make module export
// module.exports = (RoomId, Players) => {

//Timer Setup code
const timer = new Timer();
timer.on('tick', (ms) => console.log('tick', ms))
timer.on('done', () => console.log('done!', playersArray,))

//This can be used to emit the event for round changes
timer.on('statusChanged', (status) =>
    console.log('status:', status,))

timer.start(5000) // run for 5 seconds


//=================
//GAME FUNCTIONS        - Seperate out later?  What is server side and what is client side?
//================

//promptInputResumes()
    //Allow players to seed the resume card deck with 5 unique answers
    //Modal popup in the front-end?

//drawPhase() = () =>{
    //reveal Job card 
    //deal 5 resume cards to hotseat
// }

//interviewPhase()
    //60 second timer
    //display 5 resume cards as they are played

//employmentPhase()
    //Interviewer decides which applicant wins the round
    //

// roundEnd() = (Players) => {
//     //reInit gamePhase (Draw -> interview-> employment)
//     //change player roles (interviwer, hotseat)
        //record scores
// }