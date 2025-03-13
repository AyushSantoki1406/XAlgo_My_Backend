const User = require("../models/users");

const removeClient = async (req, res) => {
  try {
    const clientId = req.body.clientId;
    const email = req.body.Email;
    console.log("Client ID is:", clientId);

    // Find the user by email
    const user = await User.findOne({ Email: email });
    console.log("Client schema:", user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Filter out DeltaBrokerSchema
    user.DeltaBrokerSchema = user.DeltaBrokerSchema.filter(
      (broker) => broker.deltaBrokerId !== clientId
    );

    // Handle AccountAliases if it's a Map
    console.log("Account aliases before:", user.AccountAliases);
    if (
      user.AccountAliases instanceof Map &&
      user.AccountAliases.has(clientId)
    ) {
      user.AccountAliases.delete(clientId);
      console.log("Deleted alias:", clientId);
    } else {
      console.log("AccountAliases is not a Map or does not have the clientId");
    }

    // Filter out AngelBrokerData
    user.AngelBrokerData = user.AngelBrokerData.filter(
      (broker) => broker.AngelId !== clientId
    );

    // Update BrokerIds and BrokerCount
    user.BrokerIds = user.BrokerIds.filter((id) => id !== clientId);
    user.BrokerCount = Math.max(0, user.BrokerCount - 1);

    // Save updated user document
    await user.save();

    res.json({
      success: true,
      message: "Client removed successfully",
      updatedUser: user,
    });
  } catch (error) {
    console.error("Error while removing the client:", error);
    res
      .status(500)
      .json({ error: "An error occurred while removing the client" });
  }
};

module.exports = removeClient;
