const User = require("../models/users");
const axios = require("axios");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const ip = require("ip");
const xalgosimagePath = path.join(__dirname, "../X-Algo-Dark.png");
const xalgosimage = fs.readFileSync(xalgosimagePath, { encoding: "base64" });

const sendLoginMail = async (req, res) => {
  try {
    const checking = await User.findOne({ Email: req.body.Email });
    const userIp = req.clientIp;
    console.log(userIp);
    const deviceInfo = req.body.deviceInfo;
    const location = await getLocationFromIP(userIp);

    // Path to your email HTML template
    const emailTemplatePath = path.join(__dirname, "../email-template.html");

    // Read the email template
    let emailContent = fs.readFileSync(emailTemplatePath, "utf-8");

    // Replace placeholders with actual data
    emailContent = emailContent
      .replace("FNAME", checking.Name || "User")
      .replace("putInfo", deviceInfo || "none")
      .replace(
        "Greenville",
        `IP: ${ip.address()}, ${location.city}, ${location.regionName}, ${
          location.country
        }`
      )
      .replace("February 17th, 22:21 GMT", new Date().toUTCString());

    // Send the email
    res.json({ send: true, msg: "" });

    setTimeout(async () => {
      await sendEmail(req.body.email, emailContent);
    }, 0);
  } catch (e) {
    res.json({ send: false, msg: e });
  }
};

const sendEmail = async (userEmail, emailContent) => {
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
    to: `${userEmail}`,
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

const getLocationFromIP = async (ip) => {
  const response = await axios.get(`http://ip-api.com/json/${ip}`);
  return response.data;
};

module.exports = sendLoginMail;
