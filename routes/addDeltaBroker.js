const dns = require("dns");
const SwaggerClient = require("swagger-client");
const crypto = require("crypto");
const url = require("url");
const User = require("../models/users");

// Set DNS order for IPv4-first resolution
dns.setDefaultResultOrder("ipv4first");

const SWAGGER_URL = "https://docs.delta.exchange/api/swagger_v2.json";

// Function to generate HMAC signature
const generateSignature = (apiSecret, verb, path, timestamp, body = "") => {
  const data = body && typeof body === "object" ? JSON.stringify(body) : body;
  const message = verb + timestamp + path + data;
  return crypto.createHmac("sha256", apiSecret).update(message).digest("hex");
};

// Function to apply authorization headers
const applyAuthorization = (req, apiKey, apiSecret) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const parsedURL = url.parse(req.url);
  const path = parsedURL.pathname + (parsedURL.search || "");
  const signature = generateSignature(
    apiSecret,
    req.method || "GET",
    path,
    timestamp,
    req.body
  );

  req.headers["api-key"] = apiKey;
  req.headers["signature"] = signature;
  req.headers["timestamp"] = timestamp;
};

// Function to create the Delta REST client
const createDeltaClient = async (apiKey, apiSecret) => {
  try {
    return await new SwaggerClient({
      url: SWAGGER_URL,
      requestInterceptor: (req) => {
        req.method = req.method || "GET";
        req.url = req.url.replace(
          "https://api.delta.exchange",
          "https://api.india.delta.exchange"
        );
        applyAuthorization(req, apiKey, apiSecret);
      },
    });
  } catch (error) {
    console.error("Unable to connect to Delta API:", error);
    throw error;
  }
};

// Function to get user balances
const getUserBalance = async (req, res) => {
  try {
    const { email, apiKey, apiSecret } = req.body;
    console.log("API key and secret received:", apiKey, apiSecret);

    const client = await createDeltaClient(apiKey, apiSecret);
    const response = await client.apis.Wallet.getBalances();
    const userDetails = await client.apis.Account.getUser();
    console.log(
      "User balance response:",
      userDetails.body.result.phishing_code
    );

    const parsedData = JSON.parse(response.data);

    const userId = parsedData.result[0].user_id;

    const deltaId = userDetails.body.result.phishing_code;
    const user = await User.findOne({ Email: email });

    const currentBrokerCount = user.BrokerCount || 0; // Default to 0 if not defined
    const alias = `account ${currentBrokerCount + 1}`;
    const updatedUser = await User.findOneAndUpdate(
      { Email: email },
      {
        $push: {
          DeltaBrokerSchema: {
            deltaBrokerId: userId,
            deltaSecretKey: apiSecret,
            deltaApiKey: apiKey,
          },
          BrokerIds: userId,
          $inc: { BrokerCount: 1 },
          $set: { [`AccountAliases.${angelId}`]: alias },
        },
      },
      { new: true, upsert: false }
    );

    res.json({ success: true, response, updatedUser });
  } catch (error) {
    console.error("Error fetching balance:", error);
    res.json({ success: false, error: error.message });
  }
};

module.exports = getUserBalance;
