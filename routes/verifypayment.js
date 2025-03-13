const { set } = require('mongoose');
const User = require('../models/users');
const crypto = require("crypto");

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const verifypayment = async (req, res) => {
    const Email = req.body.Email;
    const Amount = req.body.amount;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    console.log(req.body);

    const hmac = crypto.createHmac('sha256', process.env.KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated_signature = hmac.digest('hex');
    console.log("verify the payment");

    if (generated_signature === razorpay_signature) {
        const user = await User.findOne({ Email: Email });

        const convertToIST = (date) => {
            const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
            const istDate = new Date(date.getTime() + istOffset);

            const year = istDate.getFullYear();
            const month = ('0' + (istDate.getMonth() + 1)).slice(-2);
            const day = ('0' + istDate.getDate()).slice(-2);
            const hours = ('0' + istDate.getHours()).slice(-2);
            const minutes = ('0' + istDate.getMinutes()).slice(-2);
            const seconds = ('0' + istDate.getSeconds()).slice(-2);
            console.log(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`)
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        };

        const newDate = convertToIST(new Date())
        console.log(newDate)

        let NewBalance = parseFloat(user.Balance) + parseFloat(req.body.amount);
        const result = await User.findOneAndUpdate(
            { Email: Email },
            {
                $set: { Balance: NewBalance },
                $push: {
                    Transaction: {
                        payment_type: "Deposit",
                        amount: req.body.amount,
                        date: newDate,
                        razorpay_payment_id: razorpay_payment_id,
                        razorpay_order_id: razorpay_order_id
                    }
                }
            },
            { new: true }
        );

        return res.json({ message: "payment successful", amount: result.Balance });
    } else {
        return res.json({ message: "payment failed", amount: user.Balance });
    }
}

module.exports = verifypayment;
