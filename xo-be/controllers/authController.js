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

exports.loginUser = (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) return next(err);
    if (!user || user.isBanned) return res.redirect("/login");

    req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      res.redirect("/lobby");
    });
  })(req, res, next);
};

exports.guestLogin = (req, res) => {
  req.session.guestUser = {
    username: `Guest-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    isGuest: true,
  };

  res.redirect("/lobby");
};

exports.logoutUser = (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    req.session.guestUser = null;
    res.redirect("/login");
  });
};
