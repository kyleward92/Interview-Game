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
    if (roomInput.val().length > 0 && authorInput.val().length > 0) {
      const roomNum = roomInput.val().trim();
      setName();
      window.location.href = `/join/${roomNum}`;
    }
  });

  const setName = () => {
    const name = authorInput.val().trim();
    localStorage.setItem("userName", name);
  };
});
