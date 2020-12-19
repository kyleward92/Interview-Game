$(() => {
  const roomInput = $(".roomNumInput");
  const authorInput = $(".authorInput");

  $(".hostBtn").on("click", () => {
    if (authorInput.val().length > 0) {
      window.location.href = "/host";
      setName();
    }
  });

  $(".joinBtn").on("click", () => {
    console.log("clicked");
    if (roomInput.val().length > 0 && authorInput.val().length > 0) {
      const roomNum = roomInput.val().trim();
      setName();
      window.location.href = `/join/${roomNum}`;
    }
  });

    const generateDefaultHandle = () => {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < 7; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        };
        authorInput.val(result);
    }

    //Setting input form defaults to ease testing//
    generateDefaultHandle();
    roomInput.val("1234");


    const setName = () => {
      localStorage.setItem('userName', authorInput.val());
    }
});
