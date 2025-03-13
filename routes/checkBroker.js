const User =require('../models/users')
const addbroker=require('./addbroker')
const axios=require('axios')
const userSchema=require('../models/users')
const checkBroker=async(req,res)=>{
    
    const checking = await User.findOne({ Email:req.body.Email });
    
    console.log("checkbroker.js line 9"+checking)
    console.log(checking)
    
    if(checking.Broker)
    {
        
        // const id=checking.AngeloneId;
        // const pass=checking.Angelonepass;
        // const email=checking.Email;




        console.log('Broker value in DB is true')
        // const response = await axios.post('http://localhost:5000/addbroker', { id:id, pass:pass , email:email });
        // console.log("user data "+response.data)
        res.json({ success: true });
    }
    else
    {
        console.log('Broker value in DB in false')
        res.json({success: false,responseData:null})
    }
}

module.exports = checkBroker