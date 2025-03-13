// const WebSocket = require("ws");
// const { getWebSocketServer } = require("../websocketServer");

// // Function to send random data
// function sendRandomData() {
//   const wss = getWebSocketServer();

//   // Check if there are connected clients
//   if (wss.clients.size === 0) {
//     console.log("No clients connected to receive random data.");
//     return;
//   }

//   // Send random data to all connected clients
//   wss.clients.forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) {
//       const randomValue = Math.random() * 100; // Generate random value
//       const randomData = {
//         type: "randomData",
//         data: {
//           randomValue: randomValue.toFixed(2),
//           timestamp: new Date().toISOString(),
//         },
//       };

//       client.send(JSON.stringify(randomData));
//       console.log("Sent random data:", randomData); // Log the data being sent
//     }
//   });
// }

// // Call the function periodically
// setTimeout(() => {
//   setInterval(sendRandomData, 5000); // Send random data every 5 seconds
// }, 1000);

// module.exports = { sendRandomData };
