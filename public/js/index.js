$(() => {
    // *********************************************************************************************************
    // -------------Variable Declarations-------------
    // *********************************************************************************************************

    // References to HTML elements
    const jobInput = $('.jobInput');
    const phraseInput = $('.phraseInput');
    const chatDiv = $('.chat');
    const submissionsDiv = $('.submissions');
    const currentCardDiv = $('.currentCard');
    const jobCard = $('.jobCard');
    const cardsDiv = $('.cards');
    const startBtn = $('.startBtn');
    const startDiv = $(".gameStarterDiv");
    const currentPlayerEl = $('.currentPlayer');
    const cardArray = $(".phraseCard").toArray();
    const displayName = $('.displayName');

    //is the client the current interviewer
    let isInterviewer = false;
    let isInterviewee = false;

    //has this client's name already been sent
    let isNameSent = false;

    // the room number that this client is connected to
    let currentRoom = '';

    // Name of the current user
    let userName = '';

    // *********************************************************************************************************
    // -------------JS event Listeners-------------
    // *********************************************************************************************************

    $(".submitBtn").on('click', event => {
        event.preventDefault();

        // event
        if (socket) {
            const message = $('.messageInput');
            const author = $('.authorInput');

            if (message.val().length > 0) {
                const msg = {
                    author: userName,
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
    $(".phraseCard").on('click', event => {
        event.preventDefault();

        const cardData = {
            text: event.target.value,
            room: currentRoom
        }

        event.target.disabled = true;

        socket.emit('cardClicked', cardData);

        socket.emit('updateInterviewee', currentRoom);
    });

    $(".startBtn").on('click', event => {
        event.preventDefault();

        const gameData = {
            room: currentRoom
        }

        socket.emit('drawPhase', gameData);
    })



    // *********************************************************************************************************
    // -------------Socket event setup and listners-------------
    // *********************************************************************************************************

    //create socket connection from front end
    const socket = io();
    socket.emit('newUser');

    //Testing reconnect fix.
    socket.on("connect_error", () => {
        setTimeout(() => {
            socket.connect();
        }, 1000).then(
            socket.emit('reconnect')
        );
    });


    //display room number when received from the server
    socket.on('roomInfo', (roomNum) => {
        $(".roomDisp").text(`Room Number: ${roomNum}`);
        currentRoom = roomNum;
        if (!isNameSent) {
            socket.emit('nameAssignment', { name: localStorage.getItem("userName"), room: currentRoom });
            isNameSent = true;
        }

    });

    //when a message is received from the server, print to screen
    socket.on('chat', msg => {
        $('.messages').append($('<li>').text(`${msg.author}: ${msg.message}`))
    });


    //When event card clicked is received, display the card data in the current card slot
    socket.on('cardClicked', cardData => {

        $('.currentCardDisplay').text(cardData.text);
    });

    socket.on('cardPack', cardPack => {

        for (i = 0; i < cardPack.length; i++) {
            cardArray[i].value = cardPack[i]
            cardArray[i].textContent = cardPack[i]
            cardArray[i].disabled = false;
        }
    });

    socket.on('dealJobCard', cardPack => {
        jobCard.text(`Job Name: ${cardPack}`);
    })


    // *********************************************************************************************************
    // -------------Phase event listners-------------
    // *********************************************************************************************************

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
    socket.on('employmentPhase', players => {
        console.log('Employment phase started');
        employmentPhase(players);
    });

    // *********************************************************************************************************
    // ---------Misc Socket Events-----------
    // *********************************************************************************************************

    socket.on('setCurrentPlayer', data => {
        currentPlayerEl.text(data.name);
        if (data.name == userName) {
            isInterviewee = true;
        } else {
            isInterviewee = false;
        }
    })


    socket.on('toggleInterviewer', data => {
        console.log('toggled interviewer status');
        isInterviewer = !isInterviewer;
    });


    // *********************************************************************************************************
    // ---------Submission Functions-----------
    // *********************************************************************************************************


    // adding jobs
    function addJob(job) {
        $.post("/api/jobs", job);
        console.log(`job added to room ${currentRoom}:` + job.title)
    }

    $(".addJobBtn").on('click', event => {
        event.preventDefault();
        addJob({
            title: jobInput
                .val()
                .trim(),
            roomNum: currentRoom
        });
        jobInput.val('');
    });


    // adding phrases
    function addPhrase(phrase) {
        $.post("/api/phrases", phrase);
        console.log(`phrase added to room ${currentRoom}:` + phrase.content)
    }
    $(".addPhraseBtn").on('click', event => {
        event.preventDefault();
        addPhrase({
            content: phraseInput
                .val()
                .trim(),
            roomNum: currentRoom
        });
        phraseInput.val('');
    });


    // *********************************************************************************************************
    // ---------Phase Functions-----------
    // *********************************************************************************************************


    const submissionPhase = () => {
        submissionsDiv.hide();
        currentCardDiv.hide();
        cardsDiv.hide();
    }

    const dealPhase = () => {
        if (isInterviewer) {
            submissionsDiv.hide();
            currentCardDiv.show();
            cardsDiv.hide();
            startDiv.hide();

            socket.emit('drawJobCard', currentRoom);
        } else {
            submissionsDiv.hide();
            currentCardDiv.show();
            cardsDiv.show();
            startDiv.hide();
        }

    }

    const interviewPhase = () => {

        $('.currentCardDisplay').text('');

        if (isInterviewer || !isInterviewee) {
            submissionsDiv.hide();
            currentCardDiv.show();
            cardsDiv.hide();
            startDiv.hide();
        } else {
            submissionsDiv.hide();
            currentCardDiv.show();
            cardsDiv.show();
            startDiv.hide();
        }
    }


    const employmentPhase = (players) => {
        if (isInterviewer) {

            for (i = 0; i < cardArray.length; i++) {

                cardArray[i].value = '';
                cardArray[i].textContent = '';
                cardArray[i].disabled = true;

                if (players[i + 1]) {
                    cardArray[i].value = players[i + 1].name;
                    cardArray[i].textContent = players[i + 1].name;
                    cardArray[i].disabled = false;
                }
            }
            submissionsDiv.hide();
            currentCardDiv.show();
            cardsDiv.show();
            startDiv.hide();
        } else {
            submissionsDiv.hide();
            currentCardDiv.show();
            cardsDiv.hide();
            startDiv.hide();
        }
    };



    const setDisplayName = () => {
        userName = localStorage.getItem('userName') || 'Anonymous';
        displayName.text(`Display Name: ${userName}`);
    };

    setDisplayName();
});









