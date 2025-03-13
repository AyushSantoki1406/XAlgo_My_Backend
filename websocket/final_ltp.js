const final_ltp=async(ce,pe,jwtToken)=>{

        const date=new Date();
        console.log(ce.token)
        console.log(pe.token)
        var axios = require('axios');
        var data = JSON.stringify({
            "exchange": "NFO",
            "symboltoken": ce.token, 
            "interval": "ONE_MINUTE",
            "fromdate": "2024-07-05 09:15",
            "todate": "2024-07-05 09:16"
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

        const ceresponse = await axios(config)


        console.log(JSON.stringify(ceresponse.data));
        const cejsonData = ceresponse.data;
        const ceformattedData = cejsonData.data.map(([timestamp, open, high, low, close, volume]) => ({
            timestamp,
            open,
            high,
            low,
            close,
            volume,
        }));
        
        cehigh = ceformattedData[0].high
        celow = ceformattedData[0].low

        
        var data = JSON.stringify({
            "exchange": "NFO",
            "symboltoken": pe.token, 
            "interval": "ONE_MINUTE",
            "fromdate": `2024-07-05 09:15`,
            "todate": `2024-07-05 09:16`
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

        const peresponse = await axios(config)


        console.log(JSON.stringify(peresponse.data));
        const pejsonData = peresponse.data;
        const peformattedData = pejsonData.data.map(([timestamp, open, high, low, close, volume]) => ({
            timestamp,
            open,
            high,
            low,
            close,
            volume,
        }));
        console.log(peformattedData)
        pehigh = peformattedData[0].high
        pelow = peformattedData[0].low

        return({cehigh,pehigh})
}

module.exports=final_ltp