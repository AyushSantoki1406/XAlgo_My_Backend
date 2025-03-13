const User = require("../models/users");
const axios = require("axios");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const ip = require("ip");

const getLocationFromIP = async (ip) => {
  const response = await axios.get(`http://ip-api.com/json/${ip}`);
  return response.data;
};

const verifypin = async (req, res) => {
  const userInput = req.body.userInput;
  console.log(req.body);
  const userIp = req.clientIp;
  const deviceInfo = req.body.deviceInfo;
  console.log(">>>>>>11111>>>>>", userIp);
  const pin = Number(req.body.pin);

  const user = await User.findOne({
    $and: [
      {
        $or: [{ XalgoID: userInput }, { MobileNo: userInput }],
      },
      { ClientPin: pin },
    ],
  });

  console.log(user);

  if (user) {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.", userInput);
    console.log("signin successfully");

    req.session.user = {
      clientId: user.XalgoID,
      mobileNumber: user.MobileNo,
    };

    const location = await getLocationFromIP(userIp);

    const emailTemplatePath = path.join(__dirname, "../email-template.html");

    let emailContent = fs.readFileSync(emailTemplatePath, "utf-8");
    emailContent = emailContent
      .replace("FNAME", user.Name || "User")
      .replace("putInfo", deviceInfo || "none")

      .replace(
        "Greenville",
        `IP: ${ip.address()}, ${location.city}, ${location.regionName}, ${
          location.country
        }`
      )
      .replace("February 17th, 22:21 GMT", new Date().toUTCString());

    // Send the email
    // await sendEmail(user.Email, emailContent);
    res.json({
      email: true,
      userSchema: user,
      verification: true,
      pin: true,
    });
    setTimeout(() => {
      sendEmail(user.Email, emailContent);
    }, 0);
  } else {
    res.json({ pin: false });
  }
};

const sendEmail = async (userEmail, emailContent) => {
  console.log(userEmail);
  const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net", // Replace with smtp.office365.com if using Microsoft 365
    port: 465, // Use 587 for TLS
    secure: true, // true for 465, false for 587
    auth: {
      user: "team@xalgos.in", // Your professional email
      pass: "*@|905@xalgos.in", // Your GoDaddy email password
    },
  });

  const mailOptions = {
    from: "X-Algos <team@xalgos.in>",
    to: ` ${userEmail}`,
    subject: "Login Alert",
    html: emailContent, // Use HTML content for the email
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = verifypin;
