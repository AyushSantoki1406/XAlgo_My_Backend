const User = require('../models/users');

const updateprofile = async (req, res) => {
    try {
        console.log("updateprofile");
        console.log(req.body.email); 

        const updatedata = await User.updateMany({ Email: req.body.email }, { Name : req.body.name , MobileNo : req.body.number});

        if (updatedata.nModified === 0) {
            return res.json({ message: 'No user' });
        }
        
        const data = await User.findOne({Email:req.body.email})
        // console.log(req.body.file)
        if(req.body.file){
            const updatedata2 = await User.updateOne({Email: req.body.email},{ Profile_Img : req.body.file});
        }
        


        res.json({ message: 'profile updated',profile_img:data.Profile_Img});
    } catch (error) {
        res.json({ message: 'error' });
    }
};

module.exports = updateprofile;
