const User = require("../models/users");
const nodemailer = require("nodemailer");

const signupstep1 = async (req, res) => {
  try {
    console.log(req.body.email);
    console.log(req.body);
    const user = await User.findOne({ Email: req.body.email });

    if (req.body.referralCode != "") {
      const findReferr = await User.findOne({
        "Referr.PromoCode": req.body.referralCode,
      });
      if (findReferr == null) {
        return res.json({ Referr: false });
      }
    }

    const findNumber = await User.findOne({ MobileNo: req.body.phone });

    if (user) {
      res.json({ email: false });
    } else if (findNumber) {
      res.json({ number: false });
    } else {
      const transporter = nodemailer.createTransport({
        host: "smtpout.secureserver.net",
        port: 465,
        secure: true,
        auth: {
          user: "team@xalgos.in",
          pass: "*@|905@xalgos.in",
        },
      });

      function generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
      }
      const otp = generateOTP();

      const mailOptions = {
        from: "X-Algos<team@xalgos.in>",
        to: `${req.body.email}`,
        subject: "Verify Your Email Address for X-Algos",
        html: `<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
              <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
                  style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
                  <tr>
                      <td>
                          <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                              align="center" cellpadding="0" cellspacing="0">
                              <tr>
                                  <td style="height:80px;">&nbsp;</td>
                              </tr>
          
                              <tr>
                                  <td style="height:20px;">&nbsp;</td>
                              </tr>
                              <tr>
                                <td style="padding: 20px; text-align: center; background-color: #ffa500; color: #fff;">
                                  <h1 style="margin: 0; font-size: 24px;">Verify Your Email Address</h1>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 20px;">
                                  <p style="margin: 0 0 10px;">Hi there,</p>
                                  <p style="margin: 0 0 20px;">To complete your registration or verification process, please use the following OTP:</p>
                                  <p style="margin: 0 0 20px; text-align: center;">
                                    <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #4CAF50; padding: 10px 20px; background-color: #f0f8f5; border: 1px solid #4CAF50; border-radius: 5px;">${otp}</span>
                                  </p>
                                  <p style="margin: 0 0 20px;">Please note that this OTP is valid for the next 10 minutes.</p>
                                  <p style="margin: 0 0 20px;">If you did not request this email, please ignore it or contact our support team.</p>
                                  <p style="margin: 0;">Thank you,<br>The X-Algos Team</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px; text-align: center; background-color: #f1f1f1; font-size: 12px; color: #777;">
                                  <p style="margin: 0;">&copy; 2024 X-Algos. All rights reserved.</p>
                                </td>
                              </tr>
                              <tr>
                                  <td style="height:20px;">&nbsp;</td>
                              </tr>
          
                              <tr>
                                  <td style="height:80px;">&nbsp;</td>
                              </tr>
                          </table>
                      </td>
                  </tr>
              </table>
          </body>`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error occurred:", error.message);
          res
            .status(500)
            .json({ message: "Failed to send email", error: error.message });
        } else {
          console.log("Email sent:", info.response);
          res.status(200).json({ message: "Email sent successfully" });
        }
      });
      res.json({ gmailOtp: otp, mobileNumberOtp: "000000", Referr: true });
    }
  } catch (e) {
    console.log(e);
  }
};
module.exports = signupstep1;
