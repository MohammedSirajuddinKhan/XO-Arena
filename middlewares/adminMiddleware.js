module.exports = function (req, res, next) {
  if (req.user?.isAdmin) return next();

  res.status(403).render("error", {
    message: "Admin access required",
  });
};
