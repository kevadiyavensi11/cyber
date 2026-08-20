const mongoose = require('mongoose');
const OTPVerification = require('./models/OTPVerification');

async function checkOTPs() {
    try {
        await mongoose.connect('mongodb://localhost:27017/cyber_threat_db');
        const otps = await OTPVerification.find({}).sort({ createdAt: -1 }).limit(5);
        console.log('OTP_ENTRIES_START');
        console.log(JSON.stringify(otps, null, 2));
        console.log('OTP_ENTRIES_END');
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkOTPs();
