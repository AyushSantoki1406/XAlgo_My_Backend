const User = require("../models/users");
const crypto = require("crypto");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const verifyUser = async (req, res) => {
  try {
    const decrypt = (encoded) =>
      Buffer.from(encoded, "base64").toString("utf-8");
    const encryptedEmail = req.body.urlEmail;
    console.log(encryptedEmail);
    const originalEmail = decrypt(encryptedEmail);
    console.log("Decrypted Email:", originalEmail);

    const user = await User.findOne({ Email: originalEmail });
    if (user) {
      const update = await User.updateOne(
        { Email: originalEmail },
        {
          $set: {
            Verification: true,
            Name: req.body.name,
            Password: req.body.password,
            MobileNo: "+91 8849439366",
          },
        }
      );
      console.log("Update Result:", update);
      return res.json({ message: "Password is set and verification complete" });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Decryption or database error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = verifyUser;
