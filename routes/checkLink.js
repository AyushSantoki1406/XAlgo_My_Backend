const User = require('../models/users')
const base64url=require('base64url')
const checkLink= async(req,res)=>{

    const encodedToken=req.body.encodedData

    const decodedToken = JSON.parse(base64url.decode(encodedToken));

    const expiryTime = decodedToken.expiry;
    
    if (expiryTime < Date.now()) {
       
        res.json({reset:false})
       
    }
    else
    {
        res.json({reset:true})
    }
}


module.exports=checkLink