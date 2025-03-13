// // websocket.js

// const WebSocket = require("ws");

// // WebSocket setup function
// function setupWebSocket(symbol, handlePriceUpdate) {
//   const WS_URL = "wss://socket.india.delta.exchange";
//   const ws = new WebSocket(WS_URL);

//   ws.on("open", () => {
//     console.log(`Connected to WebSocket for symbol: ${symbol}`);
//     // Send a subscription message for the specific symbol
//     const subscribeMessage = JSON.stringify({
//       type: "subscribe",
//       payload: {
//         channels: [{ name: "candlestick_1m", symbols: [symbol] }],
//       },
//     });
//     ws.send(subscribeMessage);
//   });

//   ws.on("message", (message) => {
//     try {
//       const data = JSON.parse(message);
//       if (data.symbol === symbol && data.close) {
//         const spotPrice = parseFloat(data.close);
//         handlePriceUpdate(symbol, spotPrice, () => ws.close());
//       }
//     } catch (error) {
//       console.error("Error parsing message:", error);
//     }
//   });

//   ws.on("error", (error) => {
//     console.error("WebSocket error:", error);
//   });

//   ws.on("close", () => {
//     console.log("WebSocket connection closed.");
//   });
// }

// module.exports = setupWebSocket;

// websocket.js

const WebSocket = require("ws");

// Object to keep track of WebSocket instances and their close functions
const activeWebSockets = {};

function setupWebSocket(symbol, handlePriceUpdate) {
  const WS_URL = "wss://socket.india.delta.exchange";
  const ws = new WebSocket(WS_URL);

  // Function to close the WebSocket connection
  function closeWebSocket() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log(`Closing WebSocket for symbol: ${symbol}`);
      ws.close();
      delete activeWebSockets[symbol]; // Remove from activeWebSockets
    } else {
      console.log("WebSocket is already closed or not open.");
    }
  }

  ws.on("open", () => {
    console.log(`Connected to WebSocket for symbol: ${symbol}`);
    const subscribeMessage = JSON.stringify({
      type: "subscribe",
      payload: {
        channels: [{ name: "candlestick_1m", symbols: [symbol] }],
      },
    });
    ws.send(subscribeMessage);
  });

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      if (data.symbol === symbol && data.close) {
        const spotPrice = parseFloat(data.close);
        handlePriceUpdate(symbol, spotPrice, closeWebSocket); // Pass closeWebSocket for cleanup if needed
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  ws.on("close", () => {
    console.log(`WebSocket connection closed for symbol: ${symbol}`);
  });

  // Store the close function in activeWebSockets
  activeWebSockets[symbol] = closeWebSocket;

  return closeWebSocket; // Return the function to close the WebSocket
}

// Function to close a WebSocket by symbol from other files
function closeWebSocketBySymbol(symbol) {
  if (activeWebSockets[symbol]) {
    activeWebSockets[symbol]();
  } else {
    console.log(`No active WebSocket found for symbol: ${symbol}`);
  }
}

// Export the setupWebSocket and closeWebSocketBySymbol functions
module.exports = {
  setupWebSocket,
  closeWebSocketBySymbol,
};
