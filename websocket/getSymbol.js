const getSymbole = async(req, res) => {

    const now = new Date();
    
    const Tokendata=require('./data.json')
    const final_ltp  = require('./final_ltp')
    const wbLivaData =require('./wbLiveData')

    // const a = async () => {

        let high;
        let final_PE;
        var axios = require('axios');

        const speakeasy = require('speakeasy');
        const secretKey = 'UUGDXH753M4H5FS5HJVIGBSSSU';

        // Generate TOTP code
        const totpCode = speakeasy.totp({
            secret: secretKey,
            encoding: 'base32',
        });


        var axios = require('axios');
        var data = JSON.stringify({
            "clientcode": "R51644670",
            "password": "3250",
            "totp": `${totpCode}`
        });

        var config = {
            method: 'post',
            url: 'https://apiconnect.angelbroking.com//rest/auth/angelbroking/user/v1/loginByPassword',

            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-UserType': 'USER',
                'X-SourceID': 'WEB',
                'X-ClientLocalIP': '192.168.157.1',
                'X-ClientPublicIP': '106.193.147.98',
                'X-MACAddress': 'fe80::87f:98ff:fe5a:f5cb',
                'X-PrivateKey': 'xL9TyAO8'
            },
            data: data
        };

        const response = await axios(config)


        const jsonObject = JSON.parse(JSON.stringify(response.data));
        jwtToken = jsonObject.data.jwtToken;
        console.log(jwtToken)

        var axios = require('axios');
        var data = JSON.stringify({
            "exchange": "NSE",
            "symboltoken": "99926000",
            "interval": "ONE_MINUTE",
            "fromdate": `2024-04-24 09:15`,
            "todate": `2024-04-24 09:16`
        });

        var config = {
            method: 'post',
            url: 'https://apiconnect.angelbroking.com/rest/secure/angelbroking/historical/v1/getCandleData',
            headers: {
                'X-PrivateKey': 'xL9TyAO8',
                'Accept': 'application/json',
                'X-SourceID': 'WEB',
                'X-ClientLocalIP': ' 192.168.43.238',
                'X-ClientPublicIP': '106.193.147.98',
                'X-MACAddress': 'fe80::87f:98ff:fe5a:f5cb',
                'X-UserType': 'USER',
                'Authorization': 'Bearer ' + jwtToken + '',
                'Content-Type': 'application/json'
            },
            data: data
        };

        const response2 = await axios(config)


        console.log(JSON.stringify(response2.data));
        const jsonData = response2.data;
        const formattedData = jsonData.data.map(([timestamp, open, high, low, close, volume]) => ({
            timestamp,
            open,
            high,
            low,
            close,
            volume,
        }));
        high = formattedData[0].high
        low = formattedData[0].low
        console.log(high)


        const dates = [
           
            20240410,
            20240418,
            20240425,
            20240502,
            20240509,
            20240711,
            20240718,
            20240725,
            20240801
        ];

        const dates1 = [
            "NIFTY10APR24",
            "NIFTY18APR24",
            "NIFTY25APR24",
            "NIFTY02MAY24",
            "NIFTY09MAY24",
            "NIFTY11JUL24",
            "NIFTY18JUL24",
            "NIFTY25JUL24",
            "NIFTY01AUG24",

        ];

        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // Adding 1 because months are zero-based (0-11)
        const day = currentDate.getDate();
        let dt;

        const formattedDate = `${year}${month < 10 ? '0' : ''}${month}${day < 10 ? '0' : ''}${day}`;
        console.log("Current date:", formattedDate);
        for (let index = 0; index <= dates.length; index++) {

            if (formattedDate <= dates[index]) {
                console.log("", dates1[index])
                dt = dates1[index];
                break;
            }

        }

        let strike_ce = (Math.round(high / 100) * 100);   //- 200;
        console.log('stricke ce ' + strike_ce)
        CE_symbol = dt + strike_ce + "CE"

        let strike_pe = (Math.round(low / 100) * 100);    // + 200;

        PE_symbol = dt + strike_pe + "PE"

        console.log(CE_symbol)
        console.log(PE_symbol)

        var symbols = PE_symbol
        console.log(symbols)
        // var url = "https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json";
        // const apiUrl = "https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json";

        // fetch(apiUrl)
        //     .then(response => response.json())
        //     .then(data => {
        //         // Find the object with the matching symbol
        //         // console.log(data)
        //         const matchedSymbol = data.find(item => item.symbol == symbols);

        //         if (matchedSymbol) {
        //             const token = matchedSymbol.token;
        //             console.log("Token:", token);
        //         } else {
        //             console.log("Symbol not found in the JSON data.");
        //         }
        //     })
        //     .catch(error => console.error("Error fetching data:", error));
       

        console.log(formattedData.high);

        console.log("token of pe"+final_PE)

        const ceSymbol = Tokendata.find(item => item.symbol === CE_symbol);
      
      const peSymbol = Tokendata.find(item => item.symbol === PE_symbol);
        console.log(ceSymbol)

      const final=await final_ltp(ceSymbol,peSymbol,jwtToken);
      
      console.log(ceSymbol)
      console.log(peSymbol)
      console.log(final.high)
      const ceToken=ceSymbol.token;
      const peToken=peSymbol.token;

      const cehigh=final.cehigh;
      const pehigh=final.pehigh
    
        console.log(ceToken)
      const weblivedata=await wbLivaData({ceToken,peToken})

     
      console.log("after websocket on")

      res.json({cehigh,pehigh,ceToken,peToken})
        
    }
    // a()

module.exports = getSymbole