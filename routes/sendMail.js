const nodemailer = require("nodemailer");

const sendMail = async (req, res) => {
  const userEmail = req.body.userEmail;
  const emailContent = req.body.emailContent;

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

module.exports = sendMail;
