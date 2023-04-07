module.exports = (req, res, next) => {
  console.log(req.user);
  if (!req.user.confirmedUser) {
    return res.render("confirmation/not-confirmed", {
      email: req.user.email,
    });
  }
  console.log("Confirmed User");
  next();
};
