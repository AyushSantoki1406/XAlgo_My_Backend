const User = require("../models/users");

const a = async (req, res) => {
  try {
    const user = await User.findOne({ Email: req.body.userEmail });
    if (user.MobileNo != "") {
      return res.json({ mobileNumber: true });
    } else {
      return res.json({ mobileNumber: false });
    }
  } catch (e) {
    console.log(e);
  }
};
module.exports = a;
