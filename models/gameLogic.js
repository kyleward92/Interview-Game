//Timer
const Timer = require("tiny-timer");


//gameData will be used to signal status of a state machine governing game state.
//Possible states "setup/init", (rounds) "draw", "interview", "employment".  
const gameData = { phase: "setup" }
const players = {}


//TODO make module export
// module.exports = (RoomId, Players) => {

//Timer Setup code
const timer = new Timer();


timer.on('statusChanged', (status) =>
    console.log('status:', status,))


// timer.start(5000) // run for 5 seconds


//=================
//GAME FUNCTIONS        - Seperate out later?  What is server side and what is client side?
//================

//function to handle all game timers
mainLoop = () => {

    timer.on('tick', (ms) => console.log('tick', ms))
    //TODO change 'done' behavior to round behavior functions
    switch (gameData.phase) {
        case "setup":
            setupPhase();
            break;
        //////////////////////////THESE CASE STATEMENTS MIGHT BE UNNECESSARY ONCE WE BEGIN USING EMIT?
        //     case "draw":
        //         timer.on('done', () => {
        //             console.log('done!', gameData.players),
        //                 gameData.phase = "interview",
        //                 console.log(gameData.phase)
        //         })

        //         timer.start(5000)

        //         break;

        //     case "interview":
        //         timer.on('done', () => {
        //             console.log('done!', gameData.players),
        //                 gameData.phase = "employment",
        //                 console.log(gameData.phase)
        //         })

        //         timer.start(5000)
        //         console.log(gameData.phase)
        //         break;

        //     case "employment":
        //         timer.on('done', () => {
        //             console.log('done!', gameData.players),
        //                 gameData.phase = "draw",
        //                 console.log(gameData.phase)
        //         })

        //         timer.start(5000)
        //         console.log(gameData.phase)
        //         break;

        default:
            break;
    }
}


setupPhase = () => {
    //Initial game data values

    //TODO CRUD for retrieving players
    //TODO author Player model

    //Player class will have name (from account), SCORE, flags for interviwer and hotseat(next to be interviewer)
    const one = { name: "Player One", interviewer: true };
    const two = { name: "Player Two", };
    const three = { name: "Player Three", hotseat: true };

    //this is terrible but I'm tired and want to move on testing the parts I've written.
    //TODO.  Figure out data structure of players
    players.one = one;
    players.two = two;
    players.three = three;


    //TODO CRUD actions to populate jobCards and resumeCards.  
    //TODO allow players to input resumeCards
    gameData.jobCards = [{ text: "JOBCARD 1 - FIREMAN" }, { text: "JOBCARD 2 - BARTENDER" }];
    gameData.resumeCards = [
        { text: "RESUME 1" },
        { text: "RESUME 2" },
        { text: "RESUME 3" },
        { text: "RESUME 4" },
        { text: "RESUME 5" },
        { text: "RESUME 6" },
        { text: "RESUME 7" },
        { text: "RESUME 8" },
        { text: "RESUME 9" },
        { text: "RESUME 10" },]

    //Timer to next Phase
    timer.on('done', () => {

        console.table('============SETUP done!');
        console.log(players);

        gameData.phase = "draw";
        drawPhase();

        console.log(gameData.phase)
    })


    timer.start(5000)

}


//InputResumeCards()
//Allow players to seed the resume card deck with 5 unique answers
//Modal popup in the front-end?

drawPhase = () => {
    console.log("HIT DRAW PHASE")

    let jobCards = gameData.jobCards
    let resumeCards = gameData.resumeCards

    //TODO 'emit' the data to the client
    gameData.currentJob = jobCards.splice(pickRandom(jobCards), 1);

    //Deal 5 resume cards to hotseat
    //TODO  deal 5 cards instead of 1
    players.drawnResumeCards = resumeCards.splice(pickRandom(resumeCards), 1);

    console.table(players)
    console.table(gameData)

    gameData.phase = "interview";
    interviewPhase();

}

pickRandom = (array) => {
    const num = Math.floor(Math.random() * array.length)
    return num
}

interviewPhase = () => {
    console.log("HIT THE INTERVIEW PHASE")

    // 60 second timer
    timer.on('done', () => {

        console.log('=============done with INTERVIEW PHASE');
        console.table(players.drawnResumeCards);

        gameData.phase = "employment";
        employmentPhase();

        console.log(gameData.phase)
    })

    console.log("SIXTY SECOND TIMER HERE");
    timer.start(5000)

    // display 5 resume cards as they are played

}


//employmentPhase()
//Interviewer decides which applicant wins the round
//

// roundEnd() = (Players) => {
//     //reInit gameData (Draw -> interview-> employment)
//     //change player roles (interviwer, hotseat)
//record scores
// }




mainLoop()