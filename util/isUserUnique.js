const User = require("../models/user");
module.exports = async (userName) => {
  const users = await User.find({ userName });
  if (users.length === 0) {
    return true;
  } else {
    return false;
  }
};
