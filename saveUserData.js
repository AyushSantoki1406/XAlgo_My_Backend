const User = require('./models/users');
const fs = require('fs');

const saveUserData = async (req, res) => {
    try {
        // Fetch all users from the database
        const users = await User.find({});

        // Write users data to a JSON file
        fs.writeFileSync('userData.json', JSON.stringify(users, null, 2));
        
        
        // Respond with success message
        // res.status(200).json({ message: 'User data exported successfully.' });
    } catch (error) {
        // If there's an error, respond with an error message
        console.error('Error exporting user data:', error);
        // res.status(500).json({ error: 'Internal server error.' });
    }
}

module.exports = saveUserData;
