$(() => {

    $(".hostBtn").on('click', event => {
        window.location.href = '/host';
    })

    $(".joinBtn").on('click', event => {
        if ($('.roomNumInput').val().length > 0) {
            const roomNum = $('.roomNumInput').val().trim();
            window.location.href = `/join/${roomNum}`;
        }

    })

})