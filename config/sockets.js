//create socket connection from front end

let currentRoom = '';
let currentPhase = 1;

const socket = io();

//handles emission of event when the phase button is clicked
$(".phaseBtn").on('click', event => {
    event.preventDefault();

    const data = {
        room: currentRoom,
        phase: currentPhase
    }

    socket.emit('nextPhase', data);
});

//display room number when received from the server
socket.on('roomInfo', (roomNum) => {
    $(".roomDisp").text(`Room Number: ${roomNum}`);
    currentRoom = roomNum;
})

//when a message is received from the server, print to screen
socket.on('chat', msg => {
    $('.messages').append($('<li>').text(`${msg.author}: ${msg.message}`))
})

//when next phase event is received, update the on screen indicator
socket.on('nextPhase', data => {
    currentPhase = data.newPhase;
    $('.phaseDisp').text(`Current Phase: ${currentPhase}`);
})

//When event card clicked is received, display the card data in the current card slot
socket.on('cardClicked', cardData => {
    $('.currentCard').html(`<p>${cardData.text}</p>`);
})
