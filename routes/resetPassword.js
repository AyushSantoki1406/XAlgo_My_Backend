const User = require("../models/users");
const nodemailer = require("nodemailer");
const base64url = require("base64url");
const resetPassword = async (req, res) => {
  const encodedToken = req.body.encodedData;

  const decodedToken = JSON.parse(base64url.decode(encodedToken));

  const email = decodedToken.email;
  const expiryTime = decodedToken.expiry;
  const pass = req.body.pass;

  if (expiryTime < Date.now()) {
    res.json({ reset: false });
  } else {
    const updatedUser = await User.findOneAndUpdate(
      { Email: email },
      { Password: pass }
    );
    res.json({ reset: true });
  }
};

module.exports = resetPassword;
