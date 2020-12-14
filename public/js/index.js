$(() => {

    // setting job and phrase input
    const jobInput = $('.jobInput');
    const phraseInput = $('.phraseInput');
    const chatDiv = $('.chat');
    const submissionsDiv = $('.submissions');
    const currentCardDiv = $('.currentCard');
    const jobCardDiv = $('.jobCard');
    const cardsDiv = $('.cards');


    //create socket connection from front end
    const socket = io();
    let currentRoom = '';
    let currentPhase = 1;

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

    //handles emission of event when the phase button is clicked
    $(".phaseBtn").on('click', event => {
        event.preventDefault();

        const data = {
            room: currentRoom,
            phase: currentPhase
        }

        socket.emit('nextPhase', data);
    });

    //Sends card data to the server when clicked
    $(".card").on('click', event => {
        event.preventDefault();

        const cardData = {
            text: event.target.value,
            room: currentRoom
        }

        event.target.disabled = true;

        socket.emit('cardClicked', cardData);
    });


    //display room number when received from the server
    socket.on('roomInfo', (roomNum) => {
        $(".roomDisp").text(`Room Number: ${roomNum}`);
        currentRoom = roomNum;
    });

    //when a message is received from the server, print to screen
    socket.on('chat', msg => {
        $('.messages').append($('<li>').text(`${msg.author}: ${msg.message}`))
    });

    //when next phase event is received, update the on screen indicator
    socket.on('nextPhase', data => {
        currentPhase = data.newPhase;
        $('.phaseDisp').text(`Current Phase: ${currentPhase}`)
    });

    //When event card clicked is received, display the card data in the current card slot
    socket.on('cardClicked', cardData => {
        $('.currentCard').html(`<p>${cardData.text}</p>`);
    });

    //event listener for handling the setup phase
    socket.on('setupPhase', data => {
        console.log('Submission phase started');
        submissionPhase();
    });

    //event listener for handling the draw phase
    socket.on('drawPhase', data => {
        console.log('Deal phase started');
        dealPhase();
    });

    //event listener for handling the interview phase
    socket.on('interviewPhase', data => {
        console.log('Interview phase started');
        interviewPhase();
    });

    //event listener for handling the employment phase
    socket.on('employmentPhase', data => {
        console.log('Employment phase started');
        employmentPhase();
    });





    // adding jobs
    function addJob(job) {
        $.post("/api/jobs", job);
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
        $.post("/api/phrases", phrase);
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

    // show a premade job
    function getJobs() {
        $.get("/api/premadeJobs", (data) => {
            var index = 0
            var deck = [];
            console.log(data)
            for(i=0;i<data.length;i++){
                deck.push(data[i].title)
            }
            shuffle(deck);
            // $(".jobDisplay").text(deck[index]);
            // if(index < 19){
            //     $(".jobDisplay").text(deck[index]);
            // } else {
            //     $(".jobDisplay").text("thats all the jobs");
            // }
            // index++;
        });
    }
    $(".showAjob").on('click', event => {
        event.preventDefault();
        jobDeck = getJobs();
        console.log(jobDeck)
        $(".jobDisplay").text(jobDeck[0]);

    });

    // Fisher Yates Algorithm for shuffling 
    function shuffle(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
    }
      // get the premade deck shuffled
      function getDeck() {
        $.get("/api/premadePhrases", function(data){   
            var deck = [];
            for(i=0;i<data.length;i++){
                deck.push(data[i].content)
            }
            shuffle(deck);
            console.log(deck)
        });
    }
    $(".consolePhrases").on('click', event => {
        event.preventDefault();
        getDeck();
    });


    const submissionPhase = () => {
        submissionsDiv.show();
        currentCardDiv.hide();
        jobCardDiv.hide();
        cardsDiv.hide();
    }

    const dealPhase = () => {
        submissionsDiv.hide();
        currentCardDiv.hide();
        jobCardDiv.show();
        cardsDiv.show();
    }

    const interviewPhase = () => {
        submissionsDiv.hide();
        currentCardDiv.show();
        jobCardDiv.show();
        cardsDiv.show();
    }

    const employmentPhase = () => {
        submissionsDiv.hide();
        currentCardDiv.hide();
        jobCardDiv.show();
        cardsDiv.hide();
    }
})









