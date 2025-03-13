const { default: axios } = require('axios');
const { WebSocket } = require('ws');

const stra1OrderPlace = async (a) => {
    const ws = new WebSocket('ws://localhost:3001');

    let ceEnd = false;
    let ceEntry = false;
    let entryPrice = 0;
    let ceSL = 0;
    let ceTP = 0;
    let peEnd = false;
    let exitFlag = false;
    let exit = 0;
    let peHigh = a.peHigh;
    let ceHigh = a.ceHigh;
    let ceToken = a.ceToken;
    let peToken = a.peToken;
    let peEntry = false;
    let peSL = 0;
    let peTP = 0;
    let time = '';
    let exittime = '';
    let symbol = '';
    let pl = 0;

    ws.onopen = () => {
        console.log('WebSocket connection opened');
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
        console.log('WebSocket connection closed');
    };

    ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        const date = new Date();

        if (!exitFlag) {
            if (!ceEnd && data.token == ceToken) {
                console.log(`${ceHigh} and ${peHigh} and ${data.last_traded_price}`);

                if (data.last_traded_price / 100 > ceHigh && !ceEntry) {
                    console.log('CE Entry triggered');
                    time = `${date.getHours()}:${date.getMinutes()}`;
                    symbol = ceToken;
                    entryPrice = data.last_traded_price / 100;
                    ceSL = entryPrice - 1;
                    ceTP = entryPrice + 1;
                    peEnd = true;
                    ceEntry = true;
                }

                if (data.last_traded_price / 100 > ceTP && ceEntry && !exitFlag) {
                    exit = data.last_traded_price / 100;
                    exittime = `${date.getHours()}:${date.getMinutes()}`;
                    pl = (exit - entryPrice) * 15;
                    ceEnd = true;
                    exitFlag = true;
                }

                if (data.last_traded_price / 100 < ceSL && ceEntry && !exitFlag) {
                    exit = data.last_traded_price / 100;
                    exittime = `${date.getHours()}:${date.getMinutes()}`;
                    pl = (exit - entryPrice) * 15;
                    ceEnd = true;
                    exitFlag = true;
                }
            }

            if (!peEnd && data.token == peToken) {
                if (data.last_traded_price / 100 > peHigh && !peEntry) {
                    time = `${date.getHours()}:${date.getMinutes()}`;
                    symbol = peToken;
                    entryPrice = data.last_traded_price / 100;
                    peSL = entryPrice - 1;
                    peTP = entryPrice + 1;
                    ceEnd = true;
                    peEntry = true;
                }

                if (data.last_traded_price / 100 > peTP && peEntry && !exitFlag) {
                    exit = data.last_traded_price / 100;
                    exittime = `${date.getHours()}:${date.getMinutes()}`;
                    pl = (exit - entryPrice) * 15;
                    peEnd = true;
                    exitFlag = true;
                }

                if (data.last_traded_price / 100 < peSL && peEntry && !exitFlag) {
                    exit = data.last_traded_price / 100;
                    exittime = `${date.getHours()}:${date.getMinutes()}`;
                    pl = (exit - entryPrice) * 15;
                    peEnd = true;
                    exitFlag = true;
                }
            }
        } else {
            const excelData = { no: 1, signalTime: time, symbol: symbol, quantity: 15, entryPrice: entryPrice, exit: exittime, pl: pl };
            try {
                const response = await axios.post('http://localhost:5000/add-excel-data', excelData);
                console.log('Excel data added:', response.data);
            } catch (error) {
                console.error('Error adding Excel data:', error);
            }
        }
    };
};

module.exports = stra1OrderPlace;
