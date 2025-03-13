const User = require('../models/users')

const dbschema= async(req,res)=>{

    const checking = await User.findOne({ Email:req.body.Email });
    if(checking!=null)
    {
        res.json(checking)
    }
    else{
        res.json('error')
    }
}


module.exports=dbschema