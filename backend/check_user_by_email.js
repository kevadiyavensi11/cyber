const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUser() {
    try {
        await mongoose.connect('mongodb://localhost:27017/cyber_threat_db');
        const user = await User.findOne({ email: 'kevadiyavensi11@gmail.com' });
        console.log('USER_INFO_START');
        console.log(JSON.stringify(user, null, 2));
        console.log('USER_INFO_END');
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkUser();
