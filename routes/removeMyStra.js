const User =require('../models/users')
const addbroker=require('./addbroker')
const axios=require('axios')
const userSchema=require('../models/users')
const removeMyStra=async(req,res)=>{
    
    const user = await User.findOne({ Email:req.body.Email });
    console.log(user)
    const index = req.body.index;
    user.MyStartegies = user.MyStartegies.filter(item => item !== index);

    const updatedUser = await user.save();
    res.json(updatedUser)
}

module.exports = removeMyStra