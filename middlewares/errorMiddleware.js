module.exports = (err, req, res, next) => {
  console.error(err.stack);

  res.status(500).render("error", {
    message: err.message || "Something went wrong",
  });
};
