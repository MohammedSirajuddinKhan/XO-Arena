const socket = io({
  reconnection: true,
  reconnectionAttempts: 8,
  reconnectionDelay: 500,
});

function hasValidRoomValue(value) {
  return value && value !== "undefined" && value !== "null";
}

socket.on("connect", () => {
  const roomCode = typeof ROOM_CODE === "undefined" ? "" : ROOM_CODE;
  const playerName = typeof PLAYER_NAME === "undefined" ? "" : PLAYER_NAME;
  const userId = typeof USER_ID === "undefined" ? "" : USER_ID;

  if (!hasValidRoomValue(roomCode)) {
    return;
  }

  socket.emit("join-room", {
    roomCode,
    player: hasValidRoomValue(playerName) ? playerName : "Player",
    userId: hasValidRoomValue(userId) ? userId : "",
  });
});
