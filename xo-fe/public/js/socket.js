const socket = io({
  reconnection: true,
  reconnectionAttempts: 8,
  reconnectionDelay: 500,
});

socket.emit("join-room", {
  roomCode: ROOM_CODE,
  player: PLAYER_NAME,
  userId: USER_ID,
});

socket.on("connect", () => {
  socket.emit("join-room", {
    roomCode: ROOM_CODE,
    player: PLAYER_NAME,
    userId: USER_ID,
  });
});
