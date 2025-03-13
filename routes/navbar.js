const User = require('../models/users')

const navbar = async(req,res) =>{
    const data = await User.findOne({Email:req.body.userEmail})
    if(data){
        // console.log(data)
        return res.json({img:data.Profile_Img})
    }
}

module.exports = navbar