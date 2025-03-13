const { google } = require("googleapis");
const fs = require("fs");
const User = require("../models/users");
const mongoose = require("mongoose");
const SpreadsheetService = require("../routes/spreadsheetService");
const { closeWebSocketBySymbol } = require("./websocket");

class PaperTrade {
  constructor(order) {
    this.symbol = order.symbol;
    this.size = order.size; // Number of contracts
    this.quantity = order.size || 0; // Quantity for the trade
    this.side = order.side; // 'buy' or 'sell'
    this.orderType = order.order_type; // 'limit_order' or 'market_order'
    this.entryPrice =
      this.orderType === "market_order" ? null : parseFloat(order.limit_price); // Set later if market order
    this.takeProfitPoint = order.take_profit_point;
    this.stopLossPoint = order.stop_loss_point;
    this.entryBuffer = order.entry_buffer || 0; // Buffer range for limit orders
    this.isPlaced = false; // Status of order placement
    this.isOpen = true; // Status of the trade (open/closed)
    this.runningPnL = 0; // Real-time profit and loss
    this.exitPrice = null; // Price at which the trade is exited
    this.tradeNumber = 1; // Increment this for each trade
    this.entryDate = null; // Timestamp for entry
    this.entryTimeOnly = null; // Timestamp for entry
    this.exitDate = null; // Timestamp for exit
    this.exitTimeOnly = null; // Timestamp for exit
    this.strategy = order.strategy;
    this.defaultSpreadsheetId = order.defaultSpreadsheetId;
    this.strategyName = order.strategyName;
  }

  // async appendDataToSpreadsheets(users, strategyId, data) {
  //   const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  //   const auth = new google.auth.GoogleAuth({
  //     credentials,
  //     scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  //   });
  //   const sheets = google.sheets({ version: "v4", auth });

  //   const appendToSpreadsheet = async (spreadsheetId, userEmail) => {
  //     try {
  //       const range = "Sheet1!A2"; // Start from row 2 to avoid the header row
  //       const values = data; // Only the trade data, no header

  //       await sheets.spreadsheets.values.append({
  //         spreadsheetId,
  //         range,
  //         valueInputOption: "RAW",
  //         resource: { values },
  //       });

  //       console.log(
  //         `Data appended successfully to spreadsheet for ${userEmail}`
  //       );
  //     } catch (error) {
  //       console.error(
  //         `Error appending data to ${userEmail}'s spreadsheet:`,
  //         error
  //       );
  //     }
  //   };

  //   const appendPromises = users
  //     .filter((user) => user.DeployedStrategies.includes(strategyId))
  //     .flatMap((user) =>
  //       user.Spreadsheets.map((spreadsheet) =>
  //         appendToSpreadsheet(spreadsheet.spreadsheetId, user.Email)
  //       )
  //     );

  //   // Add the default spreadsheet
  //   appendPromises.push(
  //     appendToSpreadsheet(this.defaultSpreadsheetId, "Default User")
  //   );

  //   // Wait for all promises to resolve
  //   await Promise.all(appendPromises);
  //   console.log("Data appended to all relevant spreadsheets!");
  // }

  getISTTime() {
    const date = new Date();
    const offset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
    const istDate = new Date(date.getTime() + offset);
    return istDate.toISOString().slice(0, 19).replace("T", " "); // Format as 'YYYY-MM-DD HH:MM:SS'
  }

  splitDateTime(timestamp) {
    const [date, time] = timestamp.split(" ");
    return { date, time };
  }

  checkEntryCondition(currentPrice) {
    if (this.orderType === "market_order" && !this.isPlaced) {
      this.entryPrice = currentPrice;
      this.entryTime = this.getISTTime();
      this.setExitConditions();
      this.isPlaced = true;

      const { date, time } = this.splitDateTime(this.entryTime);
      this.entryDate = date;
      this.entryTimeOnly = time;

      console.log(
        `Market order placed for ${this.side} at entry price: ${this.entryPrice}`
      );
    } else if (this.orderType === "limit_order" && !this.isPlaced) {
      if (
        this.side === "buy" &&
        currentPrice >= this.entryPrice - this.entryBuffer &&
        currentPrice <= this.entryPrice
      ) {
        this.isPlaced = true;
        this.entryTime = this.getISTTime();
        this.setExitConditions();
        console.log(
          `Buy limit order placed at entry price: ${this.entryPrice} within buffer of ${this.entryBuffer}`
        );
      } else if (
        this.side === "sell" &&
        currentPrice <= this.entryPrice + this.entryBuffer &&
        currentPrice >= this.entryPrice
      ) {
        this.isPlaced = true;
        this.entryTime = this.getISTTime();
        this.setExitConditions();
        console.log(
          `Sell limit order placed at entry price: ${this.entryPrice} within buffer of ${this.entryBuffer}`
        );
      }
    }
  }

  setExitConditions() {
    if (this.side === "buy") {
      this.takeProfit =
        parseFloat(this.entryPrice) + parseFloat(this.takeProfitPoint);
      this.stopLoss =
        parseFloat(this.entryPrice) - parseFloat(this.stopLossPoint);
    } else {
      this.takeProfit =
        parseFloat(this.entryPrice) - parseFloat(this.takeProfitPoint);
      this.stopLoss =
        parseFloat(this.entryPrice) + parseFloat(this.stopLossPoint);
    }
  }

  calculatePnL(currentPrice) {
    if (this.isPlaced) {
      const priceDifference =
        this.side === "buy"
          ? currentPrice - this.entryPrice
          : this.entryPrice - currentPrice;
      const btcEquivalent = this.size / 1000;
      this.runningPnL = priceDifference * btcEquivalent;
    }
  }

  checkExitConditions(currentPrice, closeWebsocket) {
    if (this.isPlaced) {
      if (
        this.side === "buy" &&
        (currentPrice >= this.takeProfit || currentPrice <= this.stopLoss)
      ) {
        this.isPlaced = false;
        closeWebSocketBySymbol(this.symbol);
        // closeWebsocket();
        this.closeTrade(currentPrice, closeWebsocket);
      } else if (
        this.side === "sell" &&
        (currentPrice <= this.takeProfit || currentPrice >= this.stopLoss)
      ) {
        this.isPlaced = false;
        closeWebSocketBySymbol(this.symbol);

        // closeWebsocket();
        this.closeTrade(currentPrice, closeWebsocket);
      }
    }
  }

  async closeTrade(exitPrice, closeWebsocket) {
    this.isOpen = false;
    this.exitPrice = exitPrice;
    this.exitTime = this.getISTTime(); // Timestamp for exit
    const { date, time } = this.splitDateTime(this.exitTime);
    this.exitDate = date;
    this.exitTimeOnly = time;
    console.log(
      `Trade closed at exit price: ${this.exitPrice}. Final P&L: ${this.runningPnL} $`
    );

    // if (closeWebsocket) {
    //   closeWebsocket(); // Optional: Close WebSocket if applicable
    // }

    // closeWebsocket();
    // Save trade data to Google Sheets
    await this.saveToGoogleSheet();
  }

  async saveToGoogleSheet() {
    const credentials = process.env.GOOGLE_CREDENTIALS;
    const spreadsheetService = new SpreadsheetService(credentials);

    const users = await User.find();
    const strategyId = new mongoose.Types.ObjectId(this.strategy);

    const tradeData = [
      this.tradeNumber++,
      this.symbol,
      this.side,
      this.entryDate,
      this.entryTimeOnly,
      this.exitDate,
      this.exitTimeOnly,
      this.entryPrice,
      this.exitPrice,
      this.quantity,
      this.runningPnL,
    ];

    try {
      await spreadsheetService.appendDataToSpreadsheets(
        users,
        strategyId,
        this.defaultSpreadsheetId,
        [tradeData]
      );
    } catch (error) {
      console.error("Error saving trade data to Google Sheets:", error);
    }
  }
}

module.exports = PaperTrade;

// const { google } = require("googleapis");
// const fs = require("fs");
// const User = require("../models/users");
// const mongoose = require("mongoose");

// class PaperTrade {
//   constructor(order) {
//     this.symbol = order.symbol;
//     this.size = order.size; // Number of contracts
//     this.quantity = order.size || 0; // Quantity for the trade
//     this.side = order.side; // 'buy' or 'sell'
//     this.orderType = order.order_type; // 'limit_order' or 'market_order'
//     this.entryPrice =
//       this.orderType === "market_order" ? null : parseFloat(order.limit_price); // Set later if market order
//     this.takeProfitPoint = order.take_profit_point;
//     this.stopLossPoint = order.stop_loss_point;
//     this.takeProfit = null;
//     this.stopLoss = null;
//     this.entryBuffer = order.entry_buffer || 0; // Buffer range for limit orders
//     this.isPlaced = false; // Status of order placement
//     this.isOpen = true; // Status of the trade (open/closed)
//     this.runningPnL = 0; // Real-time profit and loss
//     this.exitPrice = null; // Price at which the trade is exited
//     this.tradeNumber = 1; // Increment this for each trade
//     this.entryDate = null; // Timestamp for entry
//     this.entryTimeOnly = null; // Timestamp for entry
//     this.exitDate = null; // Timestamp for exit
//     this.exitTimeOnly = null; // Timestamp for exit
//     this.strategy = order.strategy;
//     this.defaultSpreadsheetId = order.defaultSpreadsheetId;
//     this.isClosing = false;
//     this.trailSL = order.trail_sl || 0;
//     this.trailTP = order.trail_tp || 0;
//     this.limitPrice = order.limit_price;
//   }

//   async appendDataToSpreadsheets(users, strategyId, data) {
//     const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
//     const auth = new google.auth.GoogleAuth({
//       credentials,
//       scopes: ["https://www.googleapis.com/auth/spreadsheets"],
//     });
//     const sheets = google.sheets({ version: "v4", auth });

//     const appendToSpreadsheet = async (spreadsheetId, userEmail) => {
//       try {
//         const range = "Sheet1!A2"; // Start from row 2 to avoid the header row
//         const values = data; // Only the trade data, no header

//         await sheets.spreadsheets.values.append({
//           spreadsheetId,
//           range,
//           valueInputOption: "RAW",
//           resource: { values },
//         });

//         console.log(
//           `Data appended successfully to spreadsheet for ${userEmail}`
//         );
//       } catch (error) {
//         console.error(
//           `Error appending data to ${userEmail}'s spreadsheet:`,
//           error
//         );
//       }
//     };

//     const appendPromises = users
//       .filter((user) => user.DeployedStrategies.includes(strategyId))
//       .flatMap((user) =>
//         user.Spreadsheets.map((spreadsheet) =>
//           appendToSpreadsheet(spreadsheet.spreadsheetId, user.Email)
//         )
//       );

//     console.log(appendPromises);

//     // Add the default spreadsheet
//     appendPromises.push(
//       appendToSpreadsheet(this.defaultSpreadsheetId, "Default User")
//     );

//     // Wait for all promises to resolve
//     await Promise.all(appendPromises);
//     console.log("Data appended to all relevant spreadsheets!");
//   }

//   getISTTime() {
//     const date = new Date();
//     const offset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
//     const istDate = new Date(date.getTime() + offset);
//     return istDate.toISOString().slice(0, 19).replace("T", " "); // Format as 'YYYY-MM-DD HH:MM:SS'
//   }

//   splitDateTime(timestamp) {
//     const [date, time] = timestamp.split(" ");
//     return { date, time };
//   }

//   checkEntryCondition(spotPrice) {
//     if (this.isPlaced) return;

//     if (
//       this.orderType === "market_order" ||
//       (this.orderType === "limit_order" &&
//         this.side === "buy" &&
//         spotPrice <= this.limitPrice) ||
//       (this.orderType === "limit_order" &&
//         this.side === "sell" &&
//         spotPrice >= this.limitPrice)
//     ) {
//       this.entryPrice =
//         this.orderType === "market_order" ? spotPrice : this.limitPrice;
//       this.setExitConditions();
//       console.log(
//         `${
//           this.orderType === "market_order" ? "Market" : "Limit"
//         } order placed for ${this.side} at entry price: ${this.entryPrice}`
//       );
//       // Timestamp for entry
//       const { date, time } = this.splitDateTime(this.getISTTime());
//       this.entryDate = date;
//       this.entryTimeOnly = time;
//       this.isPlaced = true;
//     }
//   }

//   setExitConditions() {
//     if (this.side === "buy") {
//       this.takeProfit =
//         parseFloat(this.entryPrice) + parseFloat(this.takeProfitPoint);
//       this.stopLoss =
//         parseFloat(this.entryPrice) - parseFloat(this.stopLossPoint);
//     } else {
//       this.takeProfit =
//         parseFloat(this.entryPrice) - parseFloat(this.takeProfitPoint);
//       this.stopLoss =
//         parseFloat(this.entryPrice) + parseFloat(this.stopLossPoint);
//     }
//   }

//   updateTrailSL(spotPrice) {
//     if (this.trailSL === 0) return;

//     if (this.side === "buy" && spotPrice >= this.entryPrice + this.trailSL) {
//       const adjustment =
//         Math.floor((spotPrice - this.entryPrice) / this.trailSL) * this.trailSL;
//       this.stopLoss = Math.max(
//         this.stopLoss,
//         this.entryPrice - this.stopLossPoint + adjustment
//       );
//     } else if (
//       this.side === "sell" &&
//       spotPrice <= this.entryPrice - this.trailSL
//     ) {
//       const adjustment =
//         Math.floor((this.entryPrice - spotPrice) / this.trailSL) * this.trailSL;
//       this.stopLoss = Math.min(
//         this.stopLoss,
//         this.entryPrice + this.stopLossPoint - adjustment
//       );
//     }
//   }

//   updateTrailTP(spotPrice) {
//     if (this.trailTP === 0) return;

//     if (this.side === "buy" && spotPrice >= this.entryPrice + this.trailTP) {
//       const adjustment =
//         Math.floor((spotPrice - this.entryPrice) / this.trailTP) * this.trailTP;
//       this.takeProfit = Math.max(
//         this.takeProfit,
//         this.entryPrice + this.takeProfitPoint + adjustment
//       );
//     } else if (
//       this.side === "sell" &&
//       spotPrice <= this.entryPrice - this.trailTP
//     ) {
//       const adjustment =
//         Math.floor((this.entryPrice - spotPrice) / this.trailTP) * this.trailTP;
//       this.takeProfit = Math.min(
//         this.takeProfit,
//         this.entryPrice - this.takeProfitPoint - adjustment
//       );
//     }
//   }

//   calculatePnL(currentPrice) {
//     if (this.isPlaced) {
//       const priceDifference =
//         this.side === "buy"
//           ? currentPrice - this.entryPrice
//           : this.entryPrice - currentPrice;
//       const btcEquivalent = this.size / 1000;
//       this.runningPnL = priceDifference * btcEquivalent;
//     }
//   }

//   checkExitConditions(currentPrice, closeWebsocket) {
//     if (this.isPlaced && !this.isClosing) {
//       if (
//         this.side === "buy" &&
//         (currentPrice >= this.takeProfit || currentPrice <= this.stopLoss)
//       ) {
//         this.isClosing = true; // Set the flag
//         this.closeTrade(currentPrice, closeWebsocket);
//       } else if (
//         this.side === "sell" &&
//         (currentPrice <= this.takeProfit || currentPrice >= this.stopLoss)
//       ) {
//         this.isClosing = true; // Set the flag
//         this.closeTrade(currentPrice, closeWebsocket);
//       }
//     }
//   }

//   async closeTrade(exitPrice, closeWebsocket) {
//     if (!this.isOpen) return; // Prevent multiple executions
//     this.isOpen = false; // Mark the trade as closed

//     if (closeWebsocket) {
//       closeWebsocket(); // Optional: Close WebSocket if applicable
//     }

//     this.exitPrice = exitPrice;
//     this.exitTime = this.getISTTime(); // Timestamp for exit
//     const { date, time } = this.splitDateTime(this.exitTime);
//     this.exitDate = date;
//     this.exitTimeOnly = time;

//     console.log(
//       `Trade closed at exit price: ${this.exitPrice}. Final P&L: ${this.runningPnL} $`
//     );

//     // Save trade data to Google Sheets
//     await this.saveToGoogleSheet();
//   }

//   async saveToGoogleSheet() {
//     const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
//     const auth = new google.auth.GoogleAuth({
//       credentials,
//       scopes: ["https://www.googleapis.com/auth/spreadsheets"],
//     });

//     const users = await User.find();
//     const strategyId = new mongoose.Types.ObjectId(this.strategy);

//     const tradeData = [
//       this.tradeNumber++,
//       this.symbol,
//       this.side,
//       this.entryDate,
//       this.entryTimeOnly,
//       this.exitDate,
//       this.exitTimeOnly,
//       this.entryPrice,
//       this.exitPrice,
//       this.quantity,
//       this.runningPnL,
//     ];

//     try {
//       console.log("qwertyuiopasdfghjkl;");
//       await this.appendDataToSpreadsheets(users, strategyId, [tradeData]);
//     } catch (error) {
//       console.error("Error saving trade data to Google Sheets:", error);
//     }
//   }
// }

// module.exports = PaperTrade;
