const User = require("../models/User");
const Game = require("../models/Game");

exports.getProfile = async (req, res) => {
  if (!req.user) return res.redirect("/register");

  const user = await User.findById(req.user._id);
  const matches = await Game.find({ players: user.username })
    .sort({ createdAt: -1 })
    .limit(10);

  res.render("user/profile", { user, matches });
};

exports.updateAvatar = async (req, res) => {
  if (!req.user) return res.redirect("/register");
  if (!req.file) return res.redirect("/profile");

  const avatar = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
  await User.findByIdAndUpdate(req.user._id, { avatar });

  res.redirect("/profile");
};
