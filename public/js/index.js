
$(() => {

    //create socket connection from front end
    const socket = io();
    let currentRoom = '';

    $(".submitBtn").on('click', event => {
        event.preventDefault();


        //make sure socket connection exists
        if (socket) {
            const message = $('.messageInput');
            const author = $('.authorInput');


            if (message.val().length > 0) {
                const msg = {
                    author: author.val(),
                    message: message.val(),
                    room: currentRoom
                }

                //send socket message from the user to the server
                socket.emit('chat', msg);
                message.val('');
            }
        }
    })



    socket.on('roomInfo', (roomNum) => {
        $(".roomDisp").text(`Room Number: ${roomNum}`);
        currentRoom = roomNum;
    })


    //when a message is received from the server, print to screen
    socket.on('chat', msg => {
        $('.messages').append($('<li>').text(`${msg.author}: ${msg.message}`))
    })

})

// setting job and phrase input
var jobInput = $('.jobInput');
var phraseInput = $('.phraseInput');

// adding jobs
function addJob(job) {
    $.post("/api/jobs", job.title);
    console.log("job added:" + job.title)
}
$(".addJobBtn").on('click', event => {
    event.preventDefault();
    addJob({
        title: jobInput
            .val()
            .trim()
    });
});
// adding phrases
function addPhrase(phrase) {
    $.post("/api/phrases", phrase.content);
    console.log("phrase added:" + phrase.content)
}
$(".addPhraseBtn").on('click', event => {
    event.preventDefault();
    addPhrase({
        content: phraseInput
            .val()
            .trim()
    });
});


