const User = require('../models/users')

const mystartegies = async(req,res) =>{
    const user = await User.findOne({Email:req.body.Email})
    const data = user.MyStartegies
    return res.json({mystartegies:data})   
}

module.exports=mystartegies