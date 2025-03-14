require("dotenv").config();
require("./models/users");

const express = require("express");
const config = require("./configs/keys");
const bodyParser = require("body-parser");
const app = express();
const requestIp = require("request-ip");
const User = require("./models/users.js");
const mongoose = require("mongoose");
const http = require("http");
const MongoStore = require("connect-mongo");
const cors = require("cors");
const session = require("express-session");
const signup = require("./routes/signup");
const signin = require("./routes/signin");
const addbroker = require("./routes/addbroker");
const checkBroker = require("./routes/checkBroker");
const deleteBroker = require("./routes/deleteBroker");
const userInfo = require("./routes/userInfo");
const dbschema = require("./routes/dbschema");
const removeClient = require("./routes/removeClient");
const verifyemail = require("./routes/verifyemail");
const wbSocket = require("./websocket/wbLiveData");
const getSymbole = require("./websocket/getSymbol");
const strategy = require("./routes/strategy");
const addExcelData = require("./createExcel/createExcel");
const resetPassword = require("./routes/resetPassword");
const forgetPassword = require("./routes/forgetPassword");
const tour = require("./routes/tour");
const removeMyStra = require("./routes/removeMyStra");
// const addDeployed = require("./routes/addDeployed");
const removeDeployed = require("./routes/removeDeployed");
const checkLink = require("./routes/checkLink");
const mobileno = require("./routes/mobileno");
const profile = require("./routes/profile");
const updateprofile = require("./routes/updateprofile");
const navbar = require("./routes/navbar");
// const addToWallet = require("./routes/addToWallet");
const verifypayment = require("./routes/verifypayment");
const newamount = require("./routes/newamount");
const mystartegies = require("./routes/mystartegies");
const subscribe = require("./routes/subscribe");
const addMarketPlaceData = require("./routes/addMarketPlaceData.js");
const getMarketPlace = require("./routes/getMarketPlace.js");
const updateSubscribe = require("./routes/updateSubscribe.js");
const removeSubscribe = require("./routes/removeSubscribe.js");
const getUserBalance = require("./routes/addDeltaBroker.js");
const strategy_2 = require("./Stra_2/Stra_2.js");
const strategy_3 = require("./Stra_3/Stra_3.js");
const authSignUp = require("./routes/authSignUP.js");
const UpdateStrategyStatus = require("./routes/UpdateStrategyStatus.js");
const { openTrades, placeOrder } = require("./paper trade/placeOrder.js");
const signupstep1 = require("./routes/signupstep1.js");
const signupstep3 = require("./routes/signupstep3.js");
const verifypin = require("./routes/verifypin.js");
const signinstep1 = require("./routes/signinstep1.js");
const signinstep2 = require("./routes/signinstep2.js");
const sendLoginMail = require("./routes/sendLoginMail.js");
const getSessions = require("./routes/getSessions.js");
// const {
//   fetchSheetData,
//   downloadCSV,
//   fetchAllSheetData,
// } = require("./routes/fetchExcelData.js");
const removeDeployStra = require("./routes/removeDeployStra.js");
const authSignIn = require("./routes/authSignIn.js");
const { setupWebSocketServer } = require("./broadcast.js");
const { Server } = require("socket.io");
const port = process.env.port || 5000;
const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("Welcome to Xalgo Backend! 🚀");
});

mongoose
  .connect(`${config.MongoUrl}`)
  .then(() => {
    console.log("Mongoose Connected");
  })
  .catch((e) => {
    console.log("Error is " + e);
  });
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

const sessionStore = MongoStore.create({
  mongoUrl: config.MongoUrl,
  collectionName: "sessions",
});

app.use(
  session({
    secret: "3e0d1775476b4811119ccb831181269292c1c6e76f9d3fc3c1363197c20710c6",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day in milliseconds
    },
    store: sessionStore,
  })
);

app.use((req, res, next) => {
  if (!req.session.user && req.path.startsWith("/secure")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (change this for security)
    methods: ["GET", "POST"],
  },
});

const pendingLogins = new Map();
const users = {}; // Store logged-in users temporarily

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("test", () => {
    console.log("yayyyyyyyyyyyyyyyyy  ");
  });
  // Generate a QR code token
  socket.on("requestQR", () => {
    const qrToken = Math.random().toString(36).substring(2);
    pendingLogins.set(qrToken, socket.id);
    console.log("QR Token Generated:", qrToken);
    socket.emit("qrCode", qrToken); // Send QR code token to frontend
  });

  socket.on("msg", () => {
    console.log("niceeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
  });

  socket.on("mobileLogin", async ({ qrToken, clientId, pin }) => {
    console.log("mobileLogin received:", qrToken, clientId, pin);
    console.log("Received mobileLogin event:");
    console.log("QR Token:", qrToken);
    console.log("Client ID:", clientId);
    console.log("PIN:", pin);
    const socketId = pendingLogins.get(qrToken);
    if (!socketId) {
      console.log("Invalid or expired QR token.");
      return;
    }

    // Simulating user authentication
    const user = await User.findOne({
      $or: [{ XalgoID: clientId }, { MobileNo: clientId }],
      ClientPin: pin,
    });

    if (user) {
      const sessionToken = Math.random().toString(36).substring(2);
      user.sessionToken = sessionToken;
      await user.save();

      users[clientId] = sessionToken; // Store user session

      // Send login success to the website
      io.to(socketId).emit("loginSuccess", { sessionToken, clientId, pin });
      socket.emit("mobileLoginResponse", {
        success: true,
        message: "Login successful",
        sessionToken,
      });

      // Remove the token from pending logins
      pendingLogins.delete(qrToken);
    } else {
      console.log("Invalid login attempt");
      socket.emit("mobileLoginResponse", {
        success: false,
        message: "Invalid login credentials",
      });
    }
  });

  // Handle website listening for login success
  socket.on("checkLoginStatus", (clientId) => {
    if (users[clientId]) {
      socket.emit("loginSuccess", { sessionToken: users[clientId], clientId });
    }
  });
});

app.post("/verify-session", async (req, res) => {
  console.log(req.body);
  const { sessionToken } = req.body;
  const user = await User.findOne({ sessionToken });
  if (user) {
    res.json({ success: true, clientId: user.clientId });
  } else {
    res.json({ success: false });
  }
});

app.use(requestIp.mw());
app.use(bodyParser.json());

app.post("/signup", signup);
app.post("/signin", signin);
app.post("/addbroker", addbroker);
app.post("/checkBroker", checkBroker);
app.post("/deleteBroker", deleteBroker);
app.post("/userinfo", userInfo);
app.post("/dbschema", dbschema);
app.post("/removeClient", removeClient);
app.post("/wbSocket", wbSocket);
app.post("/getSymbol", getSymbole);
app.post("/verifyemail", verifyemail);
app.post("/add-excel-data", addExcelData);
app.post("/resetPassword", resetPassword);
app.post("/forgetPassword", forgetPassword);
app.post("/tour", tour);
app.post("/removeMyStra", removeMyStra);
// app.post("/addDeployed", addDeployed);
app.post("/removeDeployed", removeDeployed);
app.post("/checkLink", checkLink);
app.post("/mobileno", mobileno);
app.post("/profile", profile);
app.post("/updateprofile", updateprofile);
app.post("/navbar", navbar);
// app.post("/addtowallet", addToWallet);
app.post("/verify-payment", verifypayment);
app.post("/newamount", newamount);
app.post("/myStrategies", mystartegies);
app.post("/subscribe", subscribe);
app.post("/addMarketPlaceData", addMarketPlaceData);
app.post("/getMarketPlaceData", getMarketPlace);
app.post("/updateSubscribe", updateSubscribe);
app.post("/removeSubscribe", removeSubscribe);
app.post("/addDeltaBroker", getUserBalance);
// app.post("/fetchSheetData", fetchSheetData);
app.post("/removeDeployStra", removeDeployStra);
// app.post("/downloadCSV", downloadCSV);
// app.post("/fetchAllSheetData", fetchAllSheetData);
app.post("/UpdateStrategyStatus", UpdateStrategyStatus);
app.post("/auth/signup", authSignUp);
app.post("/auth/signin", authSignIn);
app.post("/signup-step-1", signupstep1);
app.post("/signup-step-3", signupstep3);
app.post("/verify-pin", verifypin);
app.post("/signin-step-1", signinstep1);
app.post("/signin-step-2", signinstep2);
app.post("/sendLoginMail", sendLoginMail);
app.post("/getSessions", getSessions);

app.get("/testPnL", (req, res) => {
  res.json("P&L started");
  setTimeout(() => {
    placeOrder({
      symbol: "BTCUSD",
      size: "10",
      side: "sell",
      order_type: "market_order",
      // "limit_price": "59000",
      take_profit_point: 30,
      stop_loss_point: 30,
      strategy: "67208287a8f7ff08c36e54d2",
      defaultSpreadsheetId: "1vbuZ-VwVzJAN-QYgNBYsVQ10De9B0tz8AQIqxuwkjc4",
      trail_sl: "20",
      trail_tp: "20",
      strategyName: "Breakout Breeze",
    });
  }, 2000);
});

app.get("/strategy_1", (req, res) => {
  res.status(200).json({ message: "Strategy scheduled successfully." });

  setTimeout(() => {
    strategy();
  }, 0);
});

app.get("/strategy_2", (req, res) => {
  res.status(200).json({ message: "Strategy_2 scheduled successfully." });

  setTimeout(() => {
    strategy_2();
  }, 0);
});

app.post("/logout", (req, res) => {
  if (req.session) {
    const sessionId = req.sessionID;
    console.log("Session ID (from req.sessionID):", sessionId);

    // Log session details before attempting to destroy it
    console.log("Current session data:", req.session);

    // Manually retrieve the session from MongoDB store
    sessionStore.get(sessionId, (err, session) => {
      if (err) {
        console.error("Error retrieving session from MongoDB:", err);
        return res.status(500).json({
          success: false,
          message: "Error retrieving session",
        });
      }

      // Check if session exists in the store
      if (!req.session) {
        console.log("Session not found in the store.");
        return res.status(404).json({
          success: false,
          message: "Session not found",
        });
      }

      console.log("Session retrieved from store:", req.session);

      // Proceed to destroy the session in MongoDB
      sessionStore.destroy(sessionId, (err) => {
        if (err) {
          console.error("Failed to destroy session in MongoDB:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to destroy session in MongoDB",
          });
        }

        console.log("Session destroyed in MongoDB:", sessionId);

        // Now destroy the session on the server
        req.session.destroy((err) => {
          if (err) {
            console.error("Failed to destroy session:", err);
            return res.status(500).json({
              success: false,
              message: "Logout failed",
            });
          }

          // Clear the session cookie
          res.clearCookie("connect.sid", {
            path: "/",
            httpOnly: true,
            secure: false, // Set to true if using https
            expires: new Date(0), // Expire the cookie immediately
          });

          res.json({
            success: true,
            message: "Logged out successfully",
            logout: true,
          });
        });
      });
    });
  } else {
    res.json({
      success: true,
      message: "No active session to log out",
      logout: false,
    });
  }
});

app.get("/server/test", async (req, res) => {
  const strategy = "67208287a8f7ff08c36e54d2";
  const strategyId = new mongoose.Types.ObjectId(strategy);
  console.log(strategyId);
  const allUsers = await User.find({ DeployedStrategies: strategyId });
  console.log(allUsers);
  res.json("hello world 2 " + allUsers);
});

app.get("/check-session", (req, res) => {
  if (req.session && req.session.user) {
    console.log("Session ID (from req.sessionID):", req.sessionID);

    return res.json({
      activeSession: true,
      success: true,
      message: "User is logged in",
      user: req.session.user,
    });
  }
  res.json({ activeSession: false });
});

// app.listen(port, () => {
//   console.log("http://localhost:5000");
// });

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`WebSocket 1 available at ws://localhost:${port}/ws1`);
});

setupWebSocketServer(server);
