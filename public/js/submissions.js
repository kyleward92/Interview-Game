$(() => {
    const jobInput = $('.jobInput');
    const phraseInput = $('.phraseInput');

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

    const addJob = (job) => {
        // $.post("/api/jobs", job);
        console.log('gotcha');
    };

    const addPhrase = (phrase) => {
        $.post("/api/phrases", phrase);
    };
});