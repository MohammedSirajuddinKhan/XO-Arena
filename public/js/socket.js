const socket = io();

socket.emit("join-room", {
  roomCode: ROOM_CODE,
  player: "Player",
});

socket.on("update-room", (room) => {
  const cells = document.querySelectorAll(".cell");

  room.board.forEach((value, index) => {
    cells[index].textContent = value;
  });

  document.getElementById("turn").textContent = `Turn: ${room.turn}`;

  if (room.winner) {
    alert(`${room.winner} wins!`);
  }
});
