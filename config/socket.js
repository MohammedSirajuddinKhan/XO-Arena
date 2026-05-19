const Room = require("../models/Room");
const calculateWinner = require("../utils/calculateWinner");
const { isBoardFull } = require("../services/gameLogic");
const { saveCompletedMatch, updatePlayerStats } = require("../services/matchService");
const sanitizeInput = require("../utils/sanitizeInput");
const filterProfanity = require("../utils/profanityFilter");

const TURN_SECONDS = Number(process.env.TURN_SECONDS || 30);
const roomTimers = new Map();

function logSocketError(event, error) {
  console.error(`Socket event failed (${event}):`, error);
}

function normalizeRoomCode(value) {
  const roomCode = sanitizeInput(value, 12).toUpperCase();
  if (!roomCode || roomCode === "UNDEFINED" || roomCode === "NULL") return "";
  return roomCode;
}

function normalizePlayers(room) {
  room.players = room.players.map((player, index) => {
    if (typeof player === "string") {
      return {
        name: player,
        symbol: index === 0 ? "X" : "O",
        online: false,
        joinedAt: new Date(),
      };
    }

    return player;
  });
}

function publicRoom(room) {
  const doc = room.toObject ? room.toObject() : room;
  return {
    ...doc,
    players: doc.players || [],
    spectators: doc.spectators || [],
    board: Array.isArray(doc.board) ? doc.board : Array(9).fill(""),
    chat: doc.chat || [],
    turn: doc.turn || "X",
    status: doc.status || "waiting",
    turnSeconds: TURN_SECONDS,
  };
}

async function emitRoom(io, roomCode) {
  const room = await Room.findOne({ roomCode });
  if (room) io.to(roomCode).emit("update-room", publicRoom(room));
}

function scheduleTurnTimeout(io, room) {
  clearTimeout(roomTimers.get(room.roomCode));
  roomTimers.delete(room.roomCode);

  if (room.status !== "active" || room.winner || room.draw) return;

  const remaining = Math.max(0, new Date(room.turnEndsAt).getTime() - Date.now());
  const timer = setTimeout(async () => {
    try {
      const latest = await Room.findOne({ roomCode: room.roomCode });
      if (!latest || latest.status !== "active" || latest.winner || latest.draw) return;

      latest.turn = latest.turn === "X" ? "O" : "X";
      latest.turnStartedAt = new Date();
      latest.turnEndsAt = new Date(Date.now() + TURN_SECONDS * 1000);
      latest.chat.push({
        sender: "XOArena",
        message: "Turn timed out.",
        type: "system",
      });
      await latest.save();
      scheduleTurnTimeout(io, latest);
      await emitRoom(io, latest.roomCode);
    } catch (error) {
      logSocketError("turn-timeout", error);
    }
  }, remaining);

  roomTimers.set(room.roomCode, timer);
}

async function finishRoom(room) {
  if (room.status === "finished") return;

  room.status = "finished";
  room.finishedAt = new Date();
  await room.save();
  await Promise.all([saveCompletedMatch(room), updatePlayerStats(room)]);
}

async function resetRoom(room, clearPlayers = false) {
  room.board = Array(9).fill("");
  room.turn = "X";
  room.winner = null;
  room.draw = false;
  room.status = room.players.length >= 2 ? "active" : "waiting";
  room.moveHistory = [];
  room.rematchVotes = [];
  room.startedAt = room.status === "active" ? new Date() : null;
  room.finishedAt = null;
  room.turnStartedAt = new Date();
  room.turnEndsAt = room.status === "active" ? new Date(Date.now() + TURN_SECONDS * 1000) : null;
  if (clearPlayers) {
    room.players = [];
    room.spectators = [];
  }
}

module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    const safeSocketHandler = (event, handler) => {
      socket.on(event, async (...args) => {
        try {
          await handler(...args);
        } catch (error) {
          logSocketError(event, error);
          socket.emit("socket-error", {
            message: "Something went wrong. Please try again.",
          });
        }
      });
    };

    safeSocketHandler("join-room", async ({ roomCode = "", player = "", userId = "" } = {}) => {
      roomCode = normalizeRoomCode(roomCode);
      if (!roomCode) {
        socket.emit("socket-error", { message: "Invalid room link. Please create or join a room again." });
        return;
      }
      player = sanitizeInput(player, 32) || "Player";

      let room = await Room.findOne({ roomCode });

      if (!room) {
        room = await Room.create({
          roomCode,
          players: [],
          board: Array(9).fill(""),
          turn: "X",
        });
      }

      normalizePlayers(room);

      socket.join(roomCode);
      const existingPlayer = room.players.find((roomPlayer) => roomPlayer.name === player);
      const existingSpectator = room.spectators.find((spectator) => spectator.name === player);

      if (existingPlayer) {
        existingPlayer.socketId = socket.id;
        existingPlayer.online = true;
      } else if (room.players.length < 2 && room.status !== "finished") {
        room.players.push({
          name: player,
          userId,
          symbol: room.players.length === 0 ? "X" : "O",
          socketId: socket.id,
          online: true,
        });
      } else if (existingSpectator) {
        existingSpectator.socketId = socket.id;
        existingSpectator.online = true;
      } else {
        room.spectators.push({
          name: player,
          userId,
          socketId: socket.id,
          online: true,
        });
      }

      if (room.players.length >= 2 && room.status === "waiting") {
        room.status = "active";
        room.startedAt = new Date();
        room.turnStartedAt = new Date();
        room.turnEndsAt = new Date(Date.now() + TURN_SECONDS * 1000);
      }

      room.chat.push({
        sender: "XOArena",
        message: `${player} joined the room.`,
        type: "system",
      });

      await room.save();
      scheduleTurnTimeout(io, room);
      io.to(roomCode).emit("player-joined", { player });
      io.to(roomCode).emit("update-room", publicRoom(room));
    });

    safeSocketHandler("make-move", async ({ roomCode = "", index, symbol, player = "" } = {}) => {
      roomCode = normalizeRoomCode(roomCode);
      if (!roomCode) return;
      player = sanitizeInput(player, 32);
      index = Number(index);

      const room = await Room.findOne({ roomCode });

      if (!room || room.status !== "active" || room.board[index] !== "" || room.winner || room.draw) return;
      if (!Number.isInteger(index) || index < 0 || index > 8) return;

      normalizePlayers(room);
      const roomPlayer = room.players.find(
        (candidate) => candidate.name === player || candidate.socketId === socket.id,
      );
      if (!roomPlayer || roomPlayer.symbol !== symbol || room.turn !== symbol) return;

      room.board[index] = symbol;
      room.moveHistory.push({
        index,
        symbol,
        player: roomPlayer.name,
      });

      const winnerSymbol = calculateWinner(room.board);
      const winnerPlayer = winnerSymbol
        ? room.players.find((candidate) => candidate.symbol === winnerSymbol)
        : null;

      if (winnerPlayer) {
        room.winner = winnerPlayer.name;
      } else if (isBoardFull(room.board)) {
        room.draw = true;
      } else {
        room.turn = symbol === "X" ? "O" : "X";
        room.turnStartedAt = new Date();
        room.turnEndsAt = new Date(Date.now() + TURN_SECONDS * 1000);
      }

      if (room.winner || room.draw) {
        await finishRoom(room);
        clearTimeout(roomTimers.get(room.roomCode));
        roomTimers.delete(room.roomCode);
      } else {
        await room.save();
        scheduleTurnTimeout(io, room);
      }

      io.to(roomCode).emit("update-room", publicRoom(room));
    });

    safeSocketHandler("restart-game", async (roomCode) => {
      roomCode = normalizeRoomCode(roomCode);
      if (!roomCode) return;
      const room = await Room.findOne({ roomCode });

      if (!room) return;

      normalizePlayers(room);
      await resetRoom(room);
      room.chat.push({
        sender: "XOArena",
        message: "Match restarted.",
        type: "system",
      });
      await room.save();
      scheduleTurnTimeout(io, room);

      io.to(roomCode).emit("update-room", publicRoom(room));
    });

    safeSocketHandler("request-rematch", async ({ roomCode = "", player = "" } = {}) => {
      roomCode = normalizeRoomCode(roomCode);
      if (!roomCode) return;
      player = sanitizeInput(player, 32);
      const room = await Room.findOne({ roomCode });
      if (!room || room.status !== "finished") return;

      normalizePlayers(room);
      if (!room.players.some((roomPlayer) => roomPlayer.name === player)) return;
      if (!room.rematchVotes.includes(player)) room.rematchVotes.push(player);

      if (room.rematchVotes.length >= 2) {
        await resetRoom(room);
        room.chat.push({
          sender: "XOArena",
          message: "Rematch accepted.",
          type: "system",
        });
      }

      await room.save();
      scheduleTurnTimeout(io, room);
      io.to(roomCode).emit("update-room", publicRoom(room));
    });

    safeSocketHandler("room-chat", async ({ roomCode = "", player = "", message = "" } = {}) => {
      roomCode = normalizeRoomCode(roomCode);
      if (!roomCode) return;
      player = sanitizeInput(player, 32) || "Player";
      message = filterProfanity(sanitizeInput(message, 180));
      if (!message) return;

      const room = await Room.findOne({ roomCode });
      if (!room) return;

      room.chat.push({ sender: player, message, type: "user" });
      room.chat = room.chat.slice(-60);
      await room.save();
      io.to(roomCode).emit("chat-message", room.chat[room.chat.length - 1]);
    });

    safeSocketHandler("disconnect", async () => {
      const rooms = await Room.find({
        $or: [{ "players.socketId": socket.id }, { "spectators.socketId": socket.id }],
      });

      await Promise.all(
        rooms.map(async (room) => {
          normalizePlayers(room);
          const participant =
            room.players.find((player) => player.socketId === socket.id) ||
            room.spectators.find((player) => player.socketId === socket.id);

          if (participant) {
            participant.online = false;
            room.chat.push({
              sender: "XOArena",
              message: `${participant.name} left the room.`,
              type: "system",
            });
            await room.save();
            socket.to(room.roomCode).emit("player-left", { player: participant.name });
            await emitRoom(io, room.roomCode);
          }
        }),
      );

      console.log("User disconnected:", socket.id);
    });
  });
};
