module.exports = function (req, res, next) {
  if (req.isAuthenticated() || req.session.guestUser) {
    return next();
  }

  res.redirect("/login");
};
