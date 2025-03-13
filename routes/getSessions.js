const mongoose = require("mongoose");

const Session = require("../models/Session");

const getSessions = async (req, res) => {
  try {
    const clientId = req.body.clientId;

    // Find all sessions where clientId matches

    const sessions = await Session.find({
      session: { $regex: `"clientId":"${clientId}"` },
    });

    // Parse session data
    const parsedSessions = sessions.map((s) => {
      const parsedData = JSON.parse(s.session);
      return {
        clientId: parsedData.user.clientId,
        mobileNumber: parsedData.user.mobileNumber,
        expires: s.expires,
      };
    });

    res.json(parsedSessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch sessions." });
  }
};

module.exports = getSessions;
