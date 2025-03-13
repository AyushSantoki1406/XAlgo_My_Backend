const User = require("../models/users");

const signinstep1 = async (req, res) => {
  try {
    const userInput = req.body.userInput;
    if (userInput == "") {
      res.json({
        canSendOtp: false,
        message: "Client Id or Mobile number not exist",
      });
    }
    const user = await User.findOne({
      $or: [{ XalgoID: userInput }, { MobileNo: userInput }],
    });
    if (user) {
      res.json({ canSendOtp: true });
    } else {
      res.json({
        canSendOtp: false,
        message: "Client Id or Mobile number not exist",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

module.exports = signinstep1;
