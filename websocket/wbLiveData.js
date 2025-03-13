const wbLivaData = (ceToken, peToken) => {
  // const ceSymbol = req.body.ceSymbol.token;
  // const peSymbol = req.body.peSymbol.token;
  console.log("line number " + ceToken.peToken);

  const jsonData = require("./data.json");
  const { WebSocketV2 } = require("smartapi-javascript");
  const axios = require("axios");
  const WebSocket = require("ws");
  const http = require("http");

  const speakeasy = require("speakeasy");

  const secretKey = "UUGDXH753M4H5FS5HJVIGBSSSU";
  const totpCode = speakeasy.totp({
    secret: secretKey,
    encoding: "base32",
  });

  const data = JSON.stringify({
    clientcode: "R51644670",
    password: "3250",
    totp: `${totpCode}`,
  });

  const config = {
    method: "post",
    url: "https://apiconnect.angelbroking.com//rest/auth/angelbroking/user/v1/loginByPassword",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-UserType": "USER",
      "X-SourceID": "WEB",
      "X-ClientLocalIP": "192.168.43.238",
      "X-ClientPublicIP": "106.193.147.98",
      "X-MACAddress": " fe80::87f:98ff:fe5a:f5cb",
      "X-PrivateKey": "xL9TyAO8",
    },
    data: data,
  };

  const fetchDataAndConnectWebSocket = async () => {
    try {
      console.log("line 44 weblivedata.js");
      const response = await axios(config);
      const responseData = response.data;
      const jwt = responseData.data.jwtToken;

      const web_socket = new WebSocketV2({
        jwttoken: `${jwt}`,
        apikey: "xL9TyAO8 ",
        clientcode: "R51644670",
        feedtype: `${responseData.data.feedToken}`,
      });

      await web_socket.connect();
      console.log(ceToken + peToken);
      const json_req = {
        correlationID: "abcde12345",
        action: 1,
        mode: 1,
        exchangeType: 2,
        tokens: [`${ceToken.ceToken}`, `${ceToken.peToken}`],
      };

      web_socket.fetchData(json_req);
      web_socket.on("tick", receiveTick);

      function receiveTick(data) {
        // console.log(data);
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const server = http.createServer();
  const wss = new WebSocket.Server({ server }); // WebSocket server

  // Handle WebSocket connection closure
  wss.on("close", () => {
    console.log("WebSocket Server Closed");
  });

  server.listen(3001, () => {
    console.log("Server running on port 3001");
    fetchDataAndConnectWebSocket();
  });
};

module.exports = wbLivaData;
