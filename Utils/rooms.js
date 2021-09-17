const rooms = {
    generateRoomNum: (games) => {
        let roomNumber = Math.floor(Math.random() * 9999).toString();
        if (rooms.checkRoomNum(roomNumber, games)) {
            return roomNumber;
        } else {
            generateRoomNumber(games);
        };
    },

    checkRoomNum: (roomNum, games) => {
        let isRoomGood = true;

        games.forEach(game => {
            if (game.room == roomNum) {
                isRoomGood = false;
            };
        });
        return isRoomGood;
    }
};

module.exports = rooms;