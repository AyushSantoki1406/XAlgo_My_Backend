const mongoose = require("mongoose"); // Add mongoose import
const User = require("../models/users");

const UpdateStrategyStatus = async (req, res) => {
  try {
    const email = req.body.email;
    const id = req.body.id; // Strategy ID to be updated

    // Find the user by email
    const user = await User.findOne({ Email: email });
    // Find the strategy in the DeployedData array
    const strategyIndex = user.DeployedData.findIndex(
      (strategy) => strategy._id.toString() === id
    );

    // Toggle the IsActive status (if true, set false; if false, set true)
    user.DeployedData[strategyIndex].IsActive =
      !user.DeployedData[strategyIndex].IsActive;

    // Save the updated user document
    const updatedUser = await user.save();

    res.json({
      message: "Strategy status updated successfully",
      updatedUser: updatedUser,
    });
  } catch (e) {
    console.error("Error in UpdateStrategyStatus.js", e);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = UpdateStrategyStatus;
