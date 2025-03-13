const WebSocket = require("ws");

// WebSocket Server for `runningPnL`
const wss1 = new WebSocket.Server({ noServer: true });

// Function to broadcast `runningPnL` to all clients connected to `/ws1`
const broadcastRunningPnL = (data) => {
  wss1.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Function to set up WebSocket handling for an existing server
const setupWebSocketServer = (server) => {
  server.on("upgrade", (request, socket, head) => {
    const pathname = request.url;

    if (pathname === "/ws1") {
      wss1.handleUpgrade(request, socket, head, (ws) => {
        wss1.emit("connection", ws, request);
        console.log("Client connected to WebSocket 1 (/ws1)");
      });
    } else {
      socket.destroy();
    }
  });
};

// Export the setup function and broadcast function
module.exports = { setupWebSocketServer, broadcastRunningPnL };
