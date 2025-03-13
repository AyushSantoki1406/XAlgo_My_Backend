const User = require("../models/users");
const profile = async (req, res) => {
  const email = req.body;
  console.log(req.sessionID);
  const data = await User.findOne({ Email: req.body.email });
  if (data) {
    return res.json({
      name: data.Name,
      number: data.MobileNo,
      profile_img: data.Profile_Img,
      broker: data.AngelBrokerData,
    });
  }
};
module.exports = profile;
