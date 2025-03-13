const User = require("../models/users");

const removeSubscribe = async (req, res) => {
  try {
    const email = req.body.email; // Get the email from the request body
    const strategyId = req.body.strategyId; // Get the strategy ID from the request body

    // Find the user by email
    const user = await User.findOne({ Email: email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Filter out the strategy ID from the SubscribedStrategies array
    user.SubscribedStrategies = user.SubscribedStrategies.filter(
      (id) => id.toString() !== strategyId
    );

    // Save the updated user document
    const updatedUser = await user.save();

    res
      .status(200)
      .json({ message: "Strategy removed successfully", updatedUser });
  } catch (e) {
    console.error("Error in removeSubscribe.js ", e);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = removeSubscribe;
