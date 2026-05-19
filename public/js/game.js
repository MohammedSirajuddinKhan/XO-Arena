const cells = document.querySelectorAll(".cell");

cells.forEach((cell) => {
  cell.addEventListener("click", () => {
    const index = cell.dataset.index;
    const symbol = document.getElementById("turn").textContent.split(": ")[1];

    socket.emit("make-move", {
      roomCode: ROOM_CODE,
      index,
      symbol,
    });
  });
});

document.getElementById("restartBtn").addEventListener("click", () => {
  socket.emit("restart-game", ROOM_CODE);
});
