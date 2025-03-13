// spreadsheetService.js
const { google } = require("googleapis");

class SpreadsheetService {
  constructor(credentials) {
    this.auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(credentials),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    this.sheets = google.sheets({ version: "v4", auth: this.auth });
  }

  async appendToSpreadsheet(spreadsheetId, range, values) {
    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: "RAW",
        resource: { values },
      });
      console.log(
        `Data appended successfully to spreadsheet: ${spreadsheetId}`
      );
    } catch (error) {
      console.error(
        `Error appending data to spreadsheet ${spreadsheetId}:`,
        error
      );
    }
  }

  async appendDataToSpreadsheets(
    users,
    strategyId,
    defaultSpreadsheetId,
    data
  ) {
    const appendPromises = users
      .filter((user) => user.DeployedStrategies.includes(strategyId))
      .flatMap((user) =>
        user.Spreadsheets.map((spreadsheet) =>
          this.appendToSpreadsheet(spreadsheet.spreadsheetId, "Sheet1!A2", data)
        )
      );

    // Add the default spreadsheet
    appendPromises.push(
      this.appendToSpreadsheet(defaultSpreadsheetId, "Sheet1!A2", data)
    );

    // Wait for all promises to resolve
    await Promise.all(appendPromises);
    console.log("Data appended to all relevant spreadsheets!");
  }
}

module.exports = SpreadsheetService;
