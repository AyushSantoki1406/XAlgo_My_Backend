const axios = require("axios");
const User = require("./../models/users");
const mongoose = require("mongoose");
var db = mongoose.connection;

const authSignIn = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  const generateXalgoID = async () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const digits = "0123456789";

    // Generate first 4 letters
    const letterPart = Array(4)
      .fill(null)
      .map(() => letters.charAt(Math.floor(Math.random() * letters.length)))
      .join("");

    // Generate last 3 digits
    const digitPart = Array(3)
      .fill(null)
      .map(() => digits.charAt(Math.floor(Math.random() * digits.length)))
      .join("");

    return letterPart + digitPart;
  };

  const isXalgoIDUnique = async (XalgoID) => {
    const existingUser = await User.findOne({ XalgoID });
    return !existingUser;
  };
  try {
    const response = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    );
    console.log("Google User Data:", response.data);
    const googleUser = response.data;

    const user = await User.findOne({ Email: googleUser.email });

    let XalgoID;
    do {
      XalgoID = await generateXalgoID();
    } while (!(await isXalgoIDUnique(XalgoID)));
    console.log("Generated XalgoID:", XalgoID);

    if (user) {
      const user = await User.findOne({ Email: googleUser.email });
      console.log("Found User:", user);
      console.log("User already exists. Skipping insertion.");
      return res.json({ message: "true", userSchema: user });
    } else {
      const newUser = {
        Name: googleUser.name,
        Email: googleUser.email,
        Profile_Img: googleUser.picture,
        signupMethod: "Google",
        MobileNo: "",
        Balance: 0,
        Broker: false,
        Verification: true,
        BrokerCount: 0,
        ActiveStrategys: 0,
        MyStartegies: [],
        Tour: false,
        XalgoID: XalgoID,
        BrokerIds: ["Paper Trade"],
        Referr: {
          PromoCode: XalgoID,
          ReferredBy: req.body.promoCode || null,
          ReferReward: "",
          PromotingRewardAMT: 75,
          Paid: false,
          Coupnes: "",
        },
      };

      console.log("User details to insert:", newUser);

      db.collection("userdatas").insertOne(newUser, (err, result) => {
        // Renamed 'res' to 'result'
        if (err) {
          if (err.code === 11000) {
            console.log("Duplicate entry:", err.keyValue);
          } else {
            console.log("Error inserting user:", err);
          }
          return; // Make sure you exit here to avoid undefined behavior
        }
        console.log("Inserted new user to database");
        return res.json({ message: "true", user: newUser }); // Use the outer 'res'
      });
    }
  } catch (error) {
    console.error("Error in sign-in process:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authSignIn;
