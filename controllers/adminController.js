const Room = require("../models/Room");
const User = require("../models/User");
const Game = require("../models/Game");

exports.getDashboard = async (req, res) => {
  const [rooms, users, totalUsers, totalMatches, finishedMatches] = await Promise.all([
    Room.find().sort({ updatedAt: -1 }).limit(25),
    User.find().sort({ createdAt: -1 }).limit(25),
    User.countDocuments(),
    Game.countDocuments(),
    Game.find().sort({ createdAt: -1 }).limit(10),
  ]);

  res.render("admin/dashboard", {
    rooms,
    users,
    totalUsers,
    totalMatches,
    finishedMatches,
  });
};

exports.deleteRoom = async (req, res) => {
  await Room.findByIdAndDelete(req.params.roomId);
  res.redirect("/admin");
};

exports.banUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.userId, { isBanned: true });
  res.redirect("/admin");
};
