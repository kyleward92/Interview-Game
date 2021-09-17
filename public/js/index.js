$(() => {
    // *********************************************************************************************************
    // -------------Variable Declarations-------------
    // *********************************************************************************************************

    // References to HTML elements
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

        if (socket) {
            const message = $('.messageInput');

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
    socket.on('setupPhase', () => {
        submissionPhase();
    });

    //event listener for handling the draw phase
    socket.on('drawPhase', () => {
        dealPhase();
    });

    //event listener for handling the interview phase
    socket.on('interviewPhase', () => {
        interviewPhase();
    });

    //event listener for handling the employment phase
    socket.on('employmentPhase', players => {
        isEmploymentPhase = true;
        employmentPhase(players);
    });

    socket.on('endEmploymentPhase', () => {
        isEmploymentPhase = false;
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
    });

    socket.on('setCurrentInterviewer', data => {
        currentInterviewer.text(`Interviewer: ${data}`);
    });


    socket.on('toggleInterviewer', () => {
        isInterviewer = !isInterviewer;
    });

    socket.on('increaseScore', () => {
        score++;
        scoreDisplay.text(score);
    });

    socket.on('toggleAllowStart', () => {
        canStart = !canStart;
        startBtn.prop("disabled", !canStart);
    });

    socket.on('UpdatePlayerList', (data) => {
        updatePlayerList(data);
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
        $.each(players, function () {
            if (!this.interviewer) {
                var playerCard = `<div class = "col-4"><div class="card text-center"><div class="card-body"><button href="#" class="phraseCard hire btn btn-primary" value="${this.name}">${this.name}</button></div></div>`
                hiringList.append(playerCard);
            };
        });


        $(".hire").on('click', function (event) {
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

        //init click event for ready button after username has been established
        readyBtn.on("click", event => {
            const data = {
                room: currentRoom,
                userName: userName
            };
            socket.emit("toggleReady", data);
        });
    };

    const updatePlayerList = (data) => {
        playerList.empty();

        data.forEach(player => {

            let playerHTML;

            if(player.ready) {
                playerHTML = `<div class="row"> <span style="font-size: 2rem;"> ${player.name} <i class="fas fa-user-check" id="${player.name}"></i> </span> </div>`;
            } else {
                playerHTML = `<div class="row"> <span style="font-size: 2rem;"> ${player.name} <i class="fas fa-user-times" id="${player.name}"></i> </span> </div>`;
            };

            playerList.append(playerHTML);
        });
    };

    setDisplayName();
});