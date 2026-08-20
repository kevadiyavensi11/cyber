const mongoose = require('mongoose');
const User = require('./models/User');

async function check() {
    try {
        await mongoose.connect('mongodb://localhost:27017/cyber_threat_db');
        const user = await User.findById('69a470574d40903a093d6c68');
        console.log('USER_DATA_START');
        console.log(JSON.stringify(user, null, 2));
        console.log('USER_DATA_END');
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

check();
