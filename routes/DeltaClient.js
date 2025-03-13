const dns = require("dns");
const SwaggerClient = require("swagger-client");
const crypto = require("crypto");
const url = require("url");

dns.setDefaultResultOrder("ipv4first");
const SWAGGER_URL = "https://docs.delta.exchange/api/swagger_v2.json";

const generateSignature = (apiSecret, verb, path, timestamp, body = "") => {
  const data = body && typeof body === "object" ? JSON.stringify(body) : body;
  const message = verb + timestamp + path + data;
  return crypto.createHmac("sha256", apiSecret).update(message).digest("hex");
};

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

module.exports = createDeltaClient;
