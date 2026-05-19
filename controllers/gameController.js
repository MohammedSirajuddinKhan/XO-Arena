const generateRoomCode = require("../utils/generateRoomCode");
const Room = require("../models/Room");

exports.getHome = (req, res) => {
  res.render("index");
};

exports.getLobby = (req, res) => {
  res.render("game/lobby");
};

exports.createRoom = async (req, res) => {
  const roomCode = generateRoomCode();

  await Room.create({
    roomCode,
    players: [],
    board: Array(9).fill(""),
    turn: "X",
  });

  res.redirect(`/room/${roomCode}`);
};

exports.joinRoom = async (req, res) => {
  const { roomCode } = req.body;

  const room = await Room.findOne({ roomCode });

  if (!room) {
    return res.redirect("/lobby");
  }

  res.redirect(`/room/${roomCode}`);
};

exports.getRoom = async (req, res) => {
  const room = await Room.findOne({
    roomCode: req.params.roomCode,
  });

  if (!room) {
    return res.redirect("/lobby");
  }

  res.render("game/room", { room });
};

exports.getLeaderboard = (req, res) => {
  res.render("game/leaderboard");
};
