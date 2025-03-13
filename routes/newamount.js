const user = require('../models/users')

const newamount = async(req,res) =>{
    const data = await user.findOne({Email:req.body.Email})
    if(data){
        const balance = data.Balance
        const transaction = data.Transaction
        return res.json({balance:balance,Transaction:transaction})
    }
    else{
        return res.json({balance:0,Transaction:transaction})
    }
}

module.exports=newamount