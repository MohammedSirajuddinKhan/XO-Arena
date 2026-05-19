const generateRoomCode = require("../utils/generateRoomCode");
const Room = require("../models/Room");
const Game = require("../models/Game");
const User = require("../models/User");
const { getRankBadge } = require("../services/rankingService");
const sanitizeInput = require("../utils/sanitizeInput");
const { cleanupExpiredRooms } = require("../services/roomService");

function getPlayerName(req) {
  return req.user?.username || req.session.guestUser?.username || "Guest";
}

exports.getHome = (req, res) => {
  res.render("index");
};

exports.getLobby = async (req, res) => {
  await cleanupExpiredRooms();

  const activeRooms = await Room.find({ status: { $ne: "finished" } })
    .sort({ updatedAt: -1 })
    .limit(8);

  res.render("game/lobby", {
    activeRooms,
    playerName: getPlayerName(req),
  });
};

exports.createRoom = async (req, res) => {
  let roomCode = generateRoomCode();
  while (await Room.exists({ roomCode })) {
    roomCode = generateRoomCode();
  }

  await Room.create({
    roomCode,
    players: [],
    board: Array(9).fill(""),
    turn: "X",
    status: "waiting",
  });

  res.redirect(`/room/${roomCode}`);
};

exports.joinRoom = async (req, res) => {
  const roomCode = sanitizeInput(req.body.roomCode, 12).toUpperCase();

  if (!roomCode || roomCode === "UNDEFINED" || roomCode === "NULL") {
    return res.redirect("/lobby");
  }

  const room = await Room.findOne({ roomCode });

  if (!room) {
    return res.redirect("/lobby");
  }

  res.redirect(`/room/${roomCode}`);
};

exports.getRoom = async (req, res) => {
  const roomCode = sanitizeInput(req.params.roomCode, 12).toUpperCase();

  if (!roomCode || roomCode === "UNDEFINED" || roomCode === "NULL") {
    return res.redirect("/lobby");
  }

  const room = await Room.findOne({
    roomCode,
  });

  if (!room) {
    return res.redirect("/lobby");
  }

  res.render("game/room", { room });
};

exports.getLeaderboard = async (req, res) => {
  const users = await User.find({ isBanned: false })
    .sort({ elo: -1, wins: -1 })
    .limit(50);

  res.render("game/leaderboard", {
    users,
    getRankBadge,
  });
};

exports.getReplay = async (req, res) => {
  const game = await Game.findById(req.params.gameId);

  if (!game) {
    return res.status(404).render("error", { message: "Replay not found" });
  }

  res.render("game/replay", { game });
};
