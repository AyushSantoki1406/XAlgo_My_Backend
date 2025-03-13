const { google } = require("googleapis");
const fs = require("fs");
const User = require("../models/users");
const { gmail } = require("googleapis/build/src/apis/gmail");
const MarketPlace = require("../models/marketPlace");
const mongoose = require("mongoose");
// Load Google API credentials
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
  ],
});
const sheets = google.sheets({ version: "v4", auth });
const drive = google.drive({ version: "v3", auth });

const addDeployed = async (req, res) => {
  try {
    const id = req.body.selectedStrategyId; // Strategy ID
    const index = req.body.Index;
    const quantity = req.body.Quaninty;
    const email = req.body.Email;
    const account = req.body.accountKey; // Account passed from frontend
    const date = new Date();
    const applyDate =
      date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
    const strategyObjectId = new mongoose.Types.ObjectId(id);

    const strategyDetails = await MarketPlace.findOne({
      _id: strategyObjectId,
    });
    const strategyName = strategyDetails.title;

    let brokerValue = "";

    // Find user to check the BrokerData
    const user = await User.findOne({ Email: email });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Determine the Broker value
    if (account === "Paper Trade") {
      brokerValue = "Paper Trade";
    } else {
      const isAngelOne = user.AngelBrokerData.some(
        (broker) => broker.AngelId === account
      );
      const isDelta = user.DeltaBrokerSchema.some(
        (broker) => broker.deltaBrokerId === account
      );

      if (isAngelOne) {
        brokerValue = "AngelOne";
      } else if (isDelta) {
        brokerValue = "Delta";
      } else {
        return res.status(400).json({ error: "Invalid account or broker ID." });
      }
    }

    console.log("fghjkk", account);

    // Update the user
    const updatedUser = await User.findOneAndUpdate(
      { Email: email },
      {
        $push: {
          DeployedData: {
            Strategy: id,
            StrategyName: strategyName,
            Index: index,
            Quantity: quantity,
            Account: account,
            AppliedDate: applyDate,
            Broker: brokerValue,
            IsActive: true,
          },
          DeployedStrategies: id,
          DeployedStrategiesBrokerIds: account,
        },
        $inc: { ActiveStrategys: 1 },
      },
      { new: true, upsert: false }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    console.log("User updated successfully:", updatedUser);

    // Spreadsheet logic
    const existingSpreadsheet = updatedUser.Spreadsheets.find(
      (spreadsheet) => spreadsheet.strategyId.toString() === id
    );

    let spreadsheetId;
    // if (!existingSpreadsheet) {
    const resource = {
      properties: {
        title: `${email}_${id}_ ${account}`,
      },
    };
    const response = await sheets.spreadsheets.create({
      resource,
      fields: "spreadsheetId",
    });

    spreadsheetId = response.data.spreadsheetId;

    updatedUser.Spreadsheets.push({
      strategyId: id,
      spreadsheetId,
    });

    await updatedUser.save();

    console.log("Spreadsheet created and added to user:", spreadsheetId);
    // } else {
    //   spreadsheetId = existingSpreadsheet.spreadsheetId;
    //   console.log("Spreadsheet already exists:", spreadsheetId);
    // }

    const emails = [
      "harshdvadhavana26@gmail.com",
      "ayushsantoki1462004@gmail.com",
      "devpatel15.desktop@gmail.com",
    ];

    for (const email of emails) {
      await drive.permissions.create({
        fileId: spreadsheetId,
        requestBody: {
          role: "writer",
          type: "user",
          emailAddress: email,
        },
      });
    }

    const values = [];
    const range = "Sheet1!A1";
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      resource: { values },
    });

    console.log("Data appended to spreadsheet.");

    res.json(updatedUser);
  } catch (error) {
    console.error("Error in addDeployed:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deploying the strategy." });
  }
};

module.exports = addDeployed;
