const mongoose = require("mongoose");
var db = mongoose.connection;
const MarketPlace = require("../models/marketPlace");

const addMarketPlaceData = async (req, res) => {
  try {
    const newEntry = new MarketPlace({
      title: req.body.title,
      strategyType: req.body.strategyType,
      premium: false,
      capitalRequirement: req.body.capitalRequirement,
      description: req.body.description,
      time: req.body.time,
      days: req.body.days,
      subscribeCount: 0,
      deployedCount: 0,
      createdBy: req.body.createdBy,
      dateOfCreation: req.body.dateOfCreation,
    });

    await newEntry.save();
    console.log("Data added successfully to MarketPlace collection.");
    res.json("Successfully added into marketplace");
  } catch (error) {
    console.log("Error in addmarketPlace.js ", error);
  }
};

module.exports = addMarketPlaceData;
