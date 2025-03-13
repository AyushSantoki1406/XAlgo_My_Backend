var axios = require("axios");
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
const speakeasy = require("speakeasy");

// EOD4KRBA7FV3KOBYPTIVFEJI3Q  J52233047 6969
// V4LKTGHGDDI75CKQXIBFO2HWJI H54303926 6969
// UUGDXH753M4H5FS5HJVIGBSSSU R51644670 3250
// I6DWYH727T55JZEQVBJ3MRXC6E A1501341 2308
// UWjlAPIcjUfoHdDHkv0YmUtmmhEf5I VtzK7hAitOH2UoOmHh1uijfjoOaY9p8V6U5HEEvk38mofvxwndyEMJIYcru7
// u6PGxvu2GMqJcTX7hAJPnF0ijCSTWs XubP4vdMGZ9Muuiy5AKtmLNmY0k8unCzQCFD933kUg7KTnF8c4IyM1ytG3I9
// 1ctRzQLqVLXZht9wrMH8TxALNmjhR0 urWv2B2zyCdLfGhVyCEUzTxKucZFps8zUw7agtuvv0XOYEHXDJsKqF76J9px

// 408b8a89-f838-4831-af5c-9938feecb24b cbkifsm68r
// https://api.upstox.com/v2/login/authorization/dialog?client_id=408b8a89-f838-4831-af5c-9938feecb24b&redirect_uri=https://127.0.0.1:5000
const User = require("../models/users");

const addbroker = async (req, res) => {
  try {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    console.log("Fisrt value from frontend " + req.body.First);

    if (req.body.First) {
      const email = req.body.email;
      const angelId = req.body.id;
      const angelpass = req.body.pass;
      const secretKey = req.body.secretKey;
      const ApiKey = req.body.ApiKey;
      // const brokerCount = req.body.userSchema.BrokerCount;
      console.log(
        "addbroker ma email , id , password and secretkey" +
          email +
          angelId +
          angelpass +
          secretKey
      );

      const totpCode = speakeasy.totp({
        secret: secretKey,
        encoding: "base32",
      });

      var data = JSON.stringify({
        clientcode: `${angelId}`,
        password: `${angelpass}`,
        totp: `${totpCode}`,
      });

      var config = {
        method: "post",
        url: "https://apiconnect.angelbroking.com//rest/auth/angelbroking/user/v1/loginByPassword",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-UserType": "USER",
          "X-SourceID": "WEB",
          "X-ClientLocalIP": "192.168.157.1",
          "X-ClientPublicIP": "106.193.147.98",
          "X-MACAddress": "fe80::87f:98ff:fe5a:f5cb",
          "X-PrivateKey": "xL9TyAO8",
        },
        data: data,
      };

      const response = await axios(config);

      const jsonObject = JSON.parse(JSON.stringify(response.data));
      console.log(response.data);

      if (response.data.status) {
        console.log("this is for search", jsonObject.data.jwtToken);
        const user = await User.findOne({ Email: email });
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", user.BrokerCount);
        jwtToken = jsonObject.data.jwtToken;
        try {
          const currentBrokerCount = user.BrokerCount || 0; // Default to 0 if not defined
          // const alias = `account ${currentBrokerCount + 1}`;
          const formattedDate = new Date()
            .toLocaleDateString("en-GB") // Use British English to get DD/MM/YYYY format
            .replace(/\//g, "-");
          const alias = req.body.accountName;
          const updatedUser = await User.findOneAndUpdate(
            { Email: email },
            {
              $inc: { BrokerCount: 1 },
              Broker: true,
              $push: {
                AngelBrokerData: {
                  AngelId: angelId,
                  AngelPass: angelpass,
                  SecretKey: secretKey,
                  ApiKey: ApiKey,
                  Date: formattedDate,
                },
                BrokerIds: angelId,
              },
              $set: { [`AccountAliases.${angelId}`]: alias },
            }
          );
          console.log("User updated with AngelOne credentials:", updatedUser);
        } catch (error) {
          console.error(
            "Error updating user with AngelOne credentials:",
            error
          );
        }
        await delay(1000);
        var rmsconfig = {
          method: "get",
          url: "https://apiconnect.angelbroking.com/rest/secure/angelbroking/user/v1/getRMS",

          headers: {
            Authorization: "Bearer " + jwtToken + "",
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-UserType": "USER",
            "X-SourceID": "WEB",
            "X-ClientLocalIP": "192.168.187.1",
            "X-ClientPublicIP": "106.193.147.98",
            "X-MACAddress": "fe80::87f:98ff:fe5a:f5cb",
            "X-PrivateKey": "xL9TyAO8",
          },
        };

        const rmsresponce = await axios(rmsconfig);
        const a = rmsresponce.data;
        console.log(a);
        res.json(a);
      } else {
        res.json(false);
      }
    } else {
      const checking = await User.findOne({ Email: req.body.Email });

      const Email = req.body.Email;
      console.log(checking);
      const responseData = [];

      for (const schema of checking.AngelBrokerData) {
        console.log("first loop");
        const angelId = checking.UserData2;
        const angelpass = checking.Angelpass;
        const secretKey = checking.SecretKey;

        const brokerCount = req.body.userSchema.BrokerCount;
        console.log(
          "addbroker ma email , id , password and secretkey" +
            Email +
            schema.AngelId +
            schema.AngelPass
        );

        console.log("after if and else");

        const totpCode = speakeasy.totp({
          secret: `${schema.SecretKey}`,
          encoding: "base32",
        });

        console.log("test 2");

        var data = JSON.stringify({
          clientcode: `${schema.AngelId}`,
          password: `${schema.AngelPass}`,
          totp: `${totpCode}`,
        });

        var config = {
          method: "post",
          url: "https://apiconnect.angelbroking.com//rest/auth/angelbroking/user/v1/loginByPassword",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-UserType": "USER",
            "X-SourceID": "WEB",
            "X-ClientLocalIP": "192.168.157.1",
            "X-ClientPublicIP": "106.193.147.98",
            "X-MACAddress": "fe80::87f:98ff:fe5a:f5cb",
            "X-PrivateKey": "xL9TyAO8",
          },
          data: data,
        };

        console.log("test 3");

        const response = await axios(config);
        // const response = await sendRequestWithRetry(config, 3, 3000);

        console.log("test 4");

        const jsonObject = JSON.parse(JSON.stringify(response.data));
        console.log(response.data.message);
        console.log(response.data);

        if (response.data.status) {
          console.log(response.data.data.jwtToken);
          jwtToken = response.data.data.jwtToken;
          var rmsconfig = {
            method: "get",
            url: "https://apiconnect.angelbroking.com/rest/secure/angelbroking/user/v1/getRMS",

            headers: {
              Authorization: "Bearer " + jwtToken,
              "Content-Type": "application/json",
              Accept: "application/json",
              "X-UserType": "USER",
              "X-SourceID": "WEB",
              "X-ClientLocalIP": "192.168.187.1",
              "X-ClientPublicIP": "106.193.147.98",
              "X-MACAddress": "fe80::87f:98ff:fe5a:f5cb",
              "X-PrivateKey": "xL9TyAO8",
            },
          };

          const rmsresponce = await axios(rmsconfig);

          const userData = rmsresponce.data;
          console.log(userData);
          responseData.push({
            userData: userData,
          });

          console.log("a", responseData[0].userData.data.net);
        } else {
          res.json(false);
        }
      }

      console.log("line 240 hello");

      res.json(responseData);
    }
  } catch (e) {
    // console.log(e);
  }
};

module.exports = addbroker;

// const sendRequestWithRetry = async (config, retries = 3, delay = 3000) => {
//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       const response = await axios(config);
//       return response; // If successful, return the response
//     } catch (error) {
//       console.error(`Attempt ${attempt} failed: ${error.message}`);
//       if (attempt < retries) {
//         console.log(`Retrying in ${delay / 1000} seconds...`);
//         await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before retrying
//       } else {
//         throw new Error("Max retries reached. Request failed.");
//       }
//     }
//   }
// };
