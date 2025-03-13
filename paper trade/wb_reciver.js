const WebSocket = require("ws");

// Replace with your server's URL
const ws = new WebSocket("wss://websocket-0h64.onrender.com");

ws.on("open", () => {
  console.log("Connected to WebSocket server for live updates");

  // Subscribe to BTCUSD updates (or any other token)
  ws.send(JSON.stringify({ symbol: "BTCUSD" }));
});

ws.on("message", (message) => {
  const data = JSON.parse(message);
  if (data.symbol && data.price) {
    console.log(`Received live update - ${data.symbol}: ${data.price}`);
  } else if (data.message) {
    console.log(data.message); // Subscription confirmation or other server messages
  } else if (data.error) {
    console.error(data.error); // Error messages
  }
});

ws.on("close", () => {
  console.log("Disconnected from WebSocket server");
});

ws.on("error", (error) => {
  console.error("WebSocket error:", error);
});