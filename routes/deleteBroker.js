const User = require('../models/users');

const deleteBroker = async (req, res) => {
    try {
        const userData = await User.findOneAndUpdate(
            { Email: req.body.Email }, 
            { 
                $set: {
                    Broker: false,
                    AngeloneId: '',
                    Angelpass: '',
                    SecretKey:''
                }
            },
            { new: true }
        );

        if (!userData) {
            console.log('User not found');
        } else {
            console.log('Broker field updated successfully');
            console.log(userData); 
        }
        res.json(true)
    } catch (error) {
        console.error('Error occurred while updating Broker field:', error);
        res.json(false)
    }
};

module.exports = deleteBroker;
