$(() => {

    // setting job and phrase input
    const jobInput = $('.jobInput');
    const phraseInput = $('.phraseInput');
    const chatDiv = $('.chat');
    const submissionsDiv = $('.submissions');
    const currentCardDiv = $('.currentCard');
    const jobCardDiv = $('.jobCard');
    const cardsDiv = $('.cards');
    const nextJobBtn = $('.nextJob');
    const populateButtons = $('.populateButtons');
    const startBtn = $('.startBtn');
    const cardArray = $(".card").toArray();

    let isInterviewer = false;
    let isNameSent = false;


    var jobIndex = 0;
    var jobDeck = [];
    var phraseIndex = 0;
    var phraseDeck = [];


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

    $(".startBtn").on('click', event => {
        event.preventDefault();

        const gameData = {
            room: currentRoom
        }

        socket.emit('drawPhase', gameData);
    })







    //display room number when received from the server
    socket.on('roomInfo', (roomNum) => {
        $(".roomDisp").text(`Room Number: ${roomNum}`);
        currentRoom = roomNum;
        if(!isNameSent) {
            socket.emit('nameAssignment', {name: localStorage.getItem("userName"), room: currentRoom});
            isNameSent = true;
        }
        

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

    socket.on('cardPack', cardPack => {

        for (i = 0; i < cardPack.length; i++) {
            cardArray[i].value = cardPack[i]
            cardArray[i].textContent = cardPack[i]
            cardArray[i].disabled = false;
        }
    });

    socket.on('dealJobCard', cardPack => {

        $(".jobDisplay").text(cardPack);
    })

    //********************
    //Phase event listners
    //********************
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
        employmentPhase(data);
    });

    socket.on('toggleInterviewer', data => {
        console.log('toggled interviewer status');
        isInterviewer = !isInterviewer;
    })


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

    // *********************************************************************************************************
    // -----------------Manipulating Premade Decks-----------
    // *********************************************************************************************************
    // get all the jobs and shuffle them 
    async function getJobs() {
        let deck = await $.get("/api/premadeJobs", (data) => { });
        var jobDeck = [];
        for (i = 0; i < deck.length; i++) {
            jobDeck.push(deck[i].title);
        }
        shuffle(jobDeck);
        jobIndex = 0
        return jobDeck;
    }
    // define the job deck, show the next job function, prompt user
    $(".showAjob").on('click', async event => {
        event.preventDefault();
        jobDeck = await getJobs();
        nextJobBtn.show();
        $(".jobDisplay").text("Shuffled. Click next Job to begin");
    });
    // Show the next job until we run out of jobs
    nextJobBtn.on('click', async event => {
        if (jobIndex < 19) {
            $(".jobDisplay").text(jobDeck[jobIndex]);
        } else {
            $(".jobDisplay").text("thats all the jobs, hit shuffle to restart");
        }
        jobIndex++;
    })

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


    // get the premade Phrase deck shuffled
    async function getPhrases() {
        let deck = await $.get("/api/premadePhrases", (data) => { });
        var phraseDeck = [];
        for (i = 0; i < deck.length; i++) {
            phraseDeck.push(deck[i].content);
        }
        shuffle(phraseDeck);
        phraseIndex = 0
        return phraseDeck;
    }

    //  on click get all phrases shuffled and show populate button
    $(".consolePhrases").on('click', async event => {
        event.preventDefault();
        phraseDeck = await getPhrases();
        populateButtons.show();

    });

    // populate buttons with 5 new cards, reenable buttons
    populateButtons.on('click', async event => {

        var cardIndex = 0
        if (phraseIndex < 100) {
            for (i = phraseIndex; i < phraseIndex + 5; i++) {

                var cardArray = $(".card").toArray();

                cardArray[cardIndex].value = phraseDeck[i]
                cardArray[cardIndex].textContent = phraseDeck[i]
                cardArray[cardIndex].disabled = false;

                cardIndex++;
            }
            phraseIndex = phraseIndex + 5
        } else {
            phraseIndex = 0;
        }
    })



    // *********************************************************************************************************
    // ---------Phases-----------
    // *********************************************************************************************************


    const submissionPhase = () => {
        startBtn.hide();
        submissionsDiv.show();
        currentCardDiv.hide();
        jobCardDiv.hide();
        cardsDiv.hide();
    }

    const dealPhase = () => {
        if (isInterviewer) {
            startBtn.hide();
            submissionsDiv.hide();
            currentCardDiv.show();
            jobCardDiv.show();
            cardsDiv.hide();

            socket.emit('drawJobCard', currentRoom);
        } else {
            startBtn.hide();
            submissionsDiv.hide();
            currentCardDiv.hide();
            jobCardDiv.show();
            cardsDiv.show();
        }

    }

    const interviewPhase = () => {
        if (isInterviewer) {
            startBtn.hide();
            submissionsDiv.hide();
            currentCardDiv.show();
            jobCardDiv.show();
            cardsDiv.hide();
        } else {
            startBtn.hide();
            submissionsDiv.hide();
            currentCardDiv.show();
            jobCardDiv.show();
            cardsDiv.show();
        }
    }

    $('.employment').on('click', event => {
        event.preventDefault();
        socket.emit('employmentPhase', currentRoom);
    })


    const employmentPhase = (players) => {
        console.log(players);
        if (isInterviewer) {

            for (i = 0; i < cardArray.length; i++) {

                cardArray[i].value = '';
                cardArray[i].disabled = true;

                if(players[i]) {
                    cardArray[i].value = players[i].name;
                    cardArray[i].textContent = players[i].name;
                    cardArray[i].disabled = false;
                }
            }

            startBtn.hide();
            submissionsDiv.hide();
            currentCardDiv.show();
            jobCardDiv.show();
            cardsDiv.show();
        } else {
            startBtn.hide();
            submissionsDiv.hide();
            currentCardDiv.show();
            jobCardDiv.show();
            cardsDiv.hide();
        }
    }

});









