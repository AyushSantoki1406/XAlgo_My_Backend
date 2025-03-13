const { placeOrder } = require("./index.js");

placeOrder({
  symbol: "BTCUSD",
  size: 10,
  side: "buy",
  order_type: "market_order",
  // "limit_price": "59000",
  take_profit_point: 50,
  stop_loss_point: 50,
});
