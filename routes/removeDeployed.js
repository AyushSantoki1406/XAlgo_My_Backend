const  User =require('../models/users');


const removeDeployed=async(req,res)=>{

    const id=req.body.id;
    const email=req.body.Email;
    const user = await User.findOne({ Email:req.body.Email });

    const index = req.body.id;
    console.log(index)
    user.DeployedData= user.DeployedData.filter(item => item.Strategy !== index);
    
    const updatedUser = await user.save();
    res.json(updatedUser);
}


module.exports =removeDeployed;