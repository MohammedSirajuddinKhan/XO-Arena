const passport = require("passport");

exports.getLogin = (req, res) => {
  res.render("auth/login");
};

exports.getRegister = (req, res) => {
  res.render("auth/register");
};

exports.registerUser = async (req, res, next) => {
  try {
    const User = require("../models/User");
    const { username, password } = req.body;

    const user = new User({ username });

    await User.register(user, password);

    passport.authenticate("local")(req, res, () => {
      res.redirect("/lobby");
    });
  } catch (error) {
    console.log(error);
    res.redirect("/register");
  }
};

exports.loginUser = passport.authenticate("local", {
  successRedirect: "/lobby",
  failureRedirect: "/login",
});

exports.logoutUser = (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/login");
  });
};
