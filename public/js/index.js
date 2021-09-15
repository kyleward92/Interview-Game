$(() => {
    // *********************************************************************************************************
    // -------------Variable Declarations-------------
    // *********************************************************************************************************

    // References to HTML elements
    const jobInput = $('.jobInput');
    const phraseInput = $('.phraseInput');
    const submissionsDiv = $('.submissions');
    const currentCardDiv = $('.currentCard');
    const jobCard = $('.jobCard');
    const cardsDiv = $('.cards');
    const startDiv = $('.gameStarterDiv');
    const currentPlayerEl = $('.currentPlayer');
    const currentInterviewer = $('.currentInterviewer');
    const cardArray = $('.phraseCard').toArray();
    const displayName = $('.displayName');
    const scoreDisplay = $('.scoreDisp');
    const hiringList = $('.hiringList')
    const endTurnDiv = $('.endTurnDiv');
    const playerListCard = $(".playerListCard");
    const playerList = $(".playerList");
    const readyBtn = $(".readyBtn");
    const startBtn = $(".startBtn");

    //is the client the current interviewer
    let isInterviewer = false;
    let isInterviewee = false;

    //has this client's name already been sent
    let isNameSent = false;

    // the room number that this client is connected to
    let currentRoom = '';

    // User Info
    let userName = '';
    let score = 0;
    let phraseSubmissions = 0;
    let canStart = false;



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
                };

                //send socket message from the user to the server
                socket.emit('chat', msg);
                message.val('');
            };
        };
    });

    //handles emission of event when the phase button is clicked
    $(".phaseBtn").on('click', event => {
        event.preventDefault();

        const data = {
            room: currentRoom,
            phase: currentPhase
        };

        socket.emit('nextPhase', data);
    });

    //Sends card data to the server when clicked
    $(".phraseCard").on('click', event => {
        event.preventDefault();

        const cardData = {
            text: event.target.value,
            room: currentRoom
        };

        event.target.disabled = true;
        phraseSubmissions += 1;
        checkPhraseSubmissions();

        socket.emit('cardClicked', cardData);
    });

    // Ends Turn, resets phrase submission count, changes interviewee
    $(".endTurn").on('click', event => {
        event.preventDefault();
        endTurnDiv.hide();
        phraseSubmissions = 0
        socket.emit('updateInterviewee', currentRoom);
    });

    $(".startBtn").on('click', event => {
        event.preventDefault();

        const gameData = {
            room: currentRoom
        };

        socket.emit('drawPhase', gameData);
    });



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
        };

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
        isEmploymentPhase = true;
        employmentPhase(players);
    });

    socket.on('endEmploymentPhase', data => {
        isEmploymentPhase = false;
    })

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
    });

    socket.on('setCurrentInterviewer', data => {
        currentInterviewer.text(`Interviewer: ${data}`);
    });


    socket.on('toggleInterviewer', data => {
        isInterviewer = !isInterviewer;
        console.log('toggled interviewer status to ', isInterviewer);
    });

    socket.on('increaseScore', () => {
        score++;
        scoreDisplay.text(score);
    });

    socket.on('toggleReady', ({userName}) => {
        console.log('toggling ready on client');
        toggleReadyIcon(userName);
    });

    socket.on('toggleAllowStart', () => {
        console.log('Swapping Start');
        canStart = !canStart;
        startBtn.prop("disabled", !canStart);
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
        endTurnDiv.hide();
        hiringList.hide();
        playerListCard.show();
    };

    const dealPhase = () => {
        resetPhraseLabels();

        if (isInterviewer) {
            socket.emit('drawJobCard', currentRoom);
        };
    };

    const interviewPhase = () => {

        $('.currentCardDisplay').text('');
        $('.endTurn').prop('disabled', true);

        if (isInterviewer || !isInterviewee) {

            cardsDiv.hide();
        } else {
            cardsDiv.show();
            endTurnDiv.show();
        };

        hiringList.hide();
        submissionsDiv.hide();
        currentCardDiv.show();
        startDiv.hide();
        playerListCard.hide();
    };

    function populateHiringList(players) {
        console.log(players)
        $.each(players, function () {
            if (!this.interviewer) {
                var playerCard = `<div class = "col-4"><div class="card text-center"><div class="card-body"><button href="#" class="phraseCard hire btn btn-primary" value="${this.name}">${this.name}</button></div></div>`
                hiringList.append(playerCard);
                console.log(this.name)
            } else {
                // console.log("changing interviewer to false for " + this.name)
                // this.interviewer = false;
            };
        });


        $(".hire").on('click', function (event) {
            console.log($(this).val());
            var employee = (this.innerHTML);

            const gameData = {
                room: currentRoom,
                winner: event.currentTarget.value
            }
            socket.emit('endEmploymentPhase', currentRoom);
            socket.emit('assignPoint', gameData);
            socket.emit('drawPhase', gameData);
            hiringList.empty();
        });
    };

    const employmentPhase = (players) => {

        if (isInterviewer) {

            currentCardDiv.hide();
            populateHiringList(players);
            hiringList.show()

        } else {

            currentCardDiv.show();
            hiringList.hide();
        };

        submissionsDiv.hide();
        cardsDiv.hide();
        startDiv.hide();
        endTurnDiv.hide();
        playerListCard.hide();
    };

    // check to see if all 5 phrase cards have been submitted, and if so, allow the player to end their turn
    const checkPhraseSubmissions = () => {
        if (phraseSubmissions == 5) {
            $('.endTurn').prop('disabled', false);
        }
    };

    const changePhraseLabels = () => {
        $('.phrase1').text('Player 1');
        $('.phrase2').text('Player 2');
        $('.phrase3').text('Player 3');
        $('.phrase4').text('Player 4');
        $('.phrase5').text('Player 5');
    };

    const resetPhraseLabels = () => {
        $('.phrase1').text('Phrase 1');
        $('.phrase2').text('Phrase 2');
        $('.phrase3').text('Phrase 3');
        $('.phrase4').text('Phrase 4');
        $('.phrase5').text('Phrase 5');
    };

    const setDisplayName = () => {
        userName = localStorage.getItem('userName') || 'Anonymous';
        displayName.text(`Display Name: ${userName}`);

        //Append the Player entry to the playerlist
        const samplePlayer = `<div class="row"> <span style="font-size: 2rem;"> ${userName} <i class="fas fa-user-times" id="${userName}"></i> </span> </div>`
        playerList.append(samplePlayer);

        //init click event for ready button after username has been established
        readyBtn.on("click", event => {
            const data = {
                room: currentRoom,
                userName: userName
            };

            socket.emit("toggleReady", data);
        });
    };

    const toggleReadyIcon = (userName) => {
        const icon = document.getElementById(userName);
        icon.classList.toggle('fa-user-check');
        icon.classList.toggle('fa-user-times');
    };

    setDisplayName();

    console.log($("div"));
});









