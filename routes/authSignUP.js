const axios = require("axios");
const User = require("./../models/users");
const mongoose = require("mongoose");
var db = mongoose.connection;

const authSignUp = async (req, res) => {
  const { token } = req.body;
  console.log(req.body);
  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  try {
    console.log("asssssssss         ssssssssssss");
    const response = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    );
    console.log(response.data);
    const userDetails = response.data;

    const googleUser = response.data;
    console.log(googleUser);
    const user = await User.findOne({ Email: googleUser.email });
    console.log("111111111111111", googleUser.email);

    if (user) {
      console.log("Found User:", user);
      console.log("User already exists. Skipping insertion.");
      return res.json({ msg: "true", userSchema: user });
    } else {
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

      let XalgoID;
      do {
        XalgoID = await generateXalgoID();
      } while (!(await isXalgoIDUnique(XalgoID)));
      console.log("Generated XalgoID:", XalgoID);
      const newUser = {
        Name: googleUser.name,
        Email: googleUser.email,
        Profile_Img: googleUser.picture,
        signupMethod: "Google",
        MobileNo: "",
        Broker: false,
        Verification: true,
        BrokerCount: 0,
        ActiveStrategys: 0,
        MyStartegies: [],
        Tour: false,
        XalgoID: XalgoID,
        BrokerIds: ["Paper Trade"],
      };

      console.log("User details to insert:", newUser);

      db.collection("userdatas").insertOne(newUser, (err, result) => {
        if (err) {
          if (err.code === 11000) {
            console.log("Duplicate entry:", err.keyValue);
          } else {
            console.log("Error inserting user:", err);
          }
        } else {
          console.log("Inserted new user to database");
          return res.json({ userSchema: newUser, msg: "true" });
        }
      });
    }
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authSignUp;
