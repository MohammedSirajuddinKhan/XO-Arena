const cells = document.querySelectorAll(".cell");
const board = document.getElementById("board");
const turn = document.getElementById("turn");
const statusText = document.getElementById("statusText");
const timer = document.getElementById("timer");
const players = document.getElementById("players");
const spectators = document.getElementById("spectators");
const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const toast = document.getElementById("toast");
const inviteLink = document.getElementById("inviteLink");
let currentRoom = null;
let countdownInterval = null;

function display(value, fallback = "") {
  return value === undefined || value === null || value === "" ? fallback : value;
}

function showToast(message) {
  toast.textContent = display(message, "Something happened");
  toast.hidden = false;
  setTimeout(() => {
    toast.hidden = true;
  }, 2400);
}

function ownSymbol(room) {
  const player = (room.players || []).find((candidate) => candidate.name === PLAYER_NAME);
  return player?.symbol;
}

function renderParticipants(room) {
  players.innerHTML = (room.players || [])
    .map(
      (player) =>
        `<div class="participant"><strong>${display(player.symbol, "?")}: ${display(player.name, "Player")}</strong><span>${player.online ? "online" : "offline"}</span></div>`,
    )
    .join("");

  spectators.textContent = (room.spectators || []).length
    ? room.spectators.map((spectator) => display(spectator.name, "Spectator")).join(", ")
    : "No spectators";
}

function renderChat(room) {
  chatMessages.innerHTML = (room.chat || [])
    .slice(-40)
    .map(
      (message) =>
        `<p class="${message.type === "system" ? "system" : ""}"><strong>${display(message.sender, "System")}</strong>: ${display(message.message, "")}</p>`,
    )
    .join("");
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function renderTimer(room) {
  clearInterval(countdownInterval);

  if (!room.turnEndsAt || room.status !== "active") {
    timer.textContent = "Timer: --";
    return;
  }

  function tick() {
    const remaining = Math.max(0, Math.ceil((new Date(room.turnEndsAt).getTime() - Date.now()) / 1000));
    timer.textContent = `Timer: ${remaining}s`;
  }

  tick();
  countdownInterval = setInterval(tick, 1000);
}

function renderRoom(room) {
  currentRoom = room;
  const roomBoard = Array.isArray(room.board) ? room.board : Array(9).fill("");
  roomBoard.forEach((value, index) => {
    cells[index].textContent = value;
    cells[index].disabled =
      value ||
      room.status !== "active" ||
      room.winner ||
      room.draw ||
      ownSymbol(room) !== room.turn;
  });

  statusText.textContent = room.draw ? "Draw" : room.winner ? `${room.winner} wins` : display(room.status, "waiting");
  turn.textContent = `Turn: ${display(room.turn, "-")}`;
  board.classList.toggle("locked", ownSymbol(room) !== room.turn || room.status !== "active");
  renderParticipants(room);
  renderChat(room);
  renderTimer(room);
}

inviteLink.value = window.location.href;

cells.forEach((cell) => {
  cell.addEventListener("click", () => {
    if (!currentRoom) return;

    socket.emit("make-move", {
      roomCode: ROOM_CODE,
      index: cell.dataset.index,
      symbol: ownSymbol(currentRoom),
      player: PLAYER_NAME,
    });
  });
});

document.getElementById("restartBtn").addEventListener("click", () => {
  socket.emit("restart-game", ROOM_CODE);
});

document.getElementById("rematchBtn").addEventListener("click", () => {
  socket.emit("request-rematch", {
    roomCode: ROOM_CODE,
    player: PLAYER_NAME,
  });
  showToast("Rematch vote sent");
});

document.getElementById("copyInviteBtn").addEventListener("click", async () => {
  await navigator.clipboard.writeText(inviteLink.value);
  showToast("Invite copied");
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  socket.emit("room-chat", {
    roomCode: ROOM_CODE,
    player: PLAYER_NAME,
    message: chatInput.value,
  });
  chatInput.value = "";
});

socket.on("update-room", renderRoom);
socket.on("chat-message", (message) => {
  if (!currentRoom) return;
  currentRoom.chat ||= [];
  currentRoom.chat.push(message);
  renderChat(currentRoom);
});
socket.on("player-joined", ({ player }) => showToast(`${display(player, "Player")} joined`));
socket.on("player-left", ({ player }) => showToast(`${display(player, "Player")} left`));
socket.on("socket-error", ({ message }) => showToast(display(message, "Something went wrong")));
