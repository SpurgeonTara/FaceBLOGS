module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/auth/login");
  }
  console.log("Authenticated User");
  next();
};
