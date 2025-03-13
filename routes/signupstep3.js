const User = require("../models/users");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

var db = mongoose.connection;
const Coupon = require("../models/Coupons");

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

function generateReferralCode(name, mobileNumber) {
  const randomChars = (() => {
    const firstCharIsNumber = Math.random() > 0.5;

    if (firstCharIsNumber) {
      return (
        Math.floor(Math.random() * 10) +
        String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
        String.fromCharCode(65 + Math.floor(Math.random() * 26))
      );
    } else {
      return (
        String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
        Math.floor(Math.random() * 10) +
        String.fromCharCode(65 + Math.floor(Math.random() * 26))
      );
    }
  })();

  const namePart = name.substring(0, 3).toUpperCase();
  const mobilePart = mobileNumber.toString().slice(-5);

  return `${randomChars}${namePart}${mobilePart}`;
}

const signupstep3 = async (req, res) => {
  try {
    let XalgoID;
    do {
      XalgoID = await generateXalgoID();
    } while (!(await isXalgoIDUnique(XalgoID)));

    const fullName = `${req.body.firstName} ${req.body.lastName}`;
    const mobileNumber = req.body.phone;

    if (!mobileNumber) {
      return res.status(400).json({ error: "Mobile number is required." });
    }

    const existingUser = await User.findOne({ Email: req.body.email });
    if (existingUser) {
      return res.json({ signup: false, message: "User already exists" });
    }

    const newUser = {
      Name: fullName,
      Email: req.body.email,
      MobileNo: mobileNumber,
      Profile_Img: "",
      Balance: 0,
      Broker: false,
      Verification: true,
      BrokerCount: 0,
      ActiveStrategys: 0,
      MyStartegies: [],
      Tour: false,
      ClientPin: Number(req.body.pin),
      XalgoID: XalgoID,
      AccountAliases: {
        "Paper Trade": "Paper Trade",
      },
      BrokerIds: ["Paper Trade"],
      Referr: [
        {
          PromoCode: generateReferralCode(fullName, mobileNumber),
          ReferredBy: req.body.referralCode || null,
          ReferReward: "coupon1",
          PromotingRewardAMT: 75,
          Paid: false,
          Coupons: [],
        },
      ],
    };

    const insertedUser = await User.create(newUser);
    sendMail(req.body.email, XalgoID);
    return res.json({
      signup: true,
      msg: "User added without referral rewards.",
    });
  } catch (error) {
    console.error("Error in signupstep3:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const sendMail = (Email, XalgoID) => {
  const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 465,
    secure: true,
    auth: {
      user: "team@xalgos.in",
      pass: "*@|905@xalgos.in",
    },
  });

  const mailOptions = {
    from: "X-Algos<team@xalgos.in>",
    to: `${Email}`,
    subject: "Welcome to X-Algos - Your Account Details",
    html: `
      <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
        <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
          style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
          <tr>
            <td>
              <table style="background-color: #f2f3f8; max-width:670px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="height:80px;">&nbsp;</td>
                </tr>
                <tr>
                  <td style="text-align: center;">
                    <h1 style="color: #ffa500; font-size: 24px; margin: 0;">Welcome to X-Algos!</h1>
                  </td>
                </tr>
                <tr>
                  <td style="height:20px;">&nbsp;</td>
                </tr>
                <tr>
                  <td style="padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                    <p style="margin: 0 0 10px;">Hi there,</p>
                    <p style="margin: 0 0 10px;">Thank you for joining X-Algos! We are thrilled to have you on board. Your journey into algo trading starts here.</p>
                    <p style="margin: 0 0 10px;">Here are your account details to get started:</p>
                    <p style="margin: 0 0 20px;"><strong>Your X-Algos ID:</strong> ${XalgoID}</p>
                    <p style="margin: 0 0 10px;">You can use this ID to sign in to your X-Algos account and explore our platform.</p>
                    <p style="margin: 0 0 20px;">If you have any questions, feel free to reach out to our support team. We're here to help!</p>
                    <p style="margin: 0;">Happy trading,<br>The X-Algos Team</p>
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
      </body>
    `,
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
};

// sendMail("harshhackathon2024@gmail.com", "Hars007");

module.exports = signupstep3;
