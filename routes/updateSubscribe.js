const MarketPlace = require("../models/marketPlace");
const User = require("../models/users");

const updateSubscribe = async (req, res) => {
  try {
    const strategyId = req.body.strategyId;
    const email = req.body.email;
    const updatedStrategy = await MarketPlace.findByIdAndUpdate(
      strategyId,
      { $inc: { subscribeCount: 1 } },
      { new: true }
    );

    if (!updatedStrategy) {
      return res.status(404).json({ error: "Strategy not found" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { Email: email },
      {
        $push: {
          SubscribedStrategies: strategyId,
        },
      },
      { new: true }
    );

    console.log(updatedUser.SubscribedStrategies);

    res.status(200).json({
      newSubscribeCount: updatedStrategy.subscribeCount,
      SubscribedStrategies: updatedUser.SubscribedStrategies,
      userSchema: updatedUser,
    });
  } catch (e) {
    console.error("Error in updateSubscribe.js ", e);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = updateSubscribe;
