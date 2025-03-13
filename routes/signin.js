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

const signin = async (req, res) => {
  const checking = await User.findOne({ Email: req.body.email });
  const userIp = req.clientIp;
  const deviceInfo = req.body.deviceInfo;
  console.log(">>>>>>>>>>>", userIp);

  if (checking) {
    if (checking.Verification) {
      if (checking.Password == req.body.pass) {
        console.log("signin successfully");

        // Get location data
        const location = await getLocationFromIP(userIp);

        // Path to your email HTML template
        const emailTemplatePath = path.join(
          __dirname,
          "../email-template.html"
        );

        // Read the email template
        let emailContent = fs.readFileSync(emailTemplatePath, "utf-8");

        // Replace placeholders with actual data
        emailContent = emailContent
          .replace("*FNAME*", checking.Name || "User")
          .replace("putInfo", deviceInfo || "none")

          .replace(
            "Greenville",
            `IP: ${ip.address()}, ${location.city}, ${location.regionName}, ${
              location.country
            }`
          )
          .replace("February 17th, 22:21 GMT", new Date().toUTCString());

        // Send the email
        await sendEmail(req.body.email, emailContent);

        res.json({
          email: true,
          password: true,
          userSchema: checking,
          verification: true,
        });
      } else {
        res.json({ email: true, password: false, verification: true });
      }
    } else {
      res.json({ email: true, verification: false });
    }
  } else {
    res.json({ email: false });
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

module.exports = signin;
