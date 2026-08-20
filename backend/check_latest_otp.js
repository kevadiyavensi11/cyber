const mongoose = require('mongoose');
const OTPVerification = require('./models/OTPVerification');

async function checkOTPs() {
    try {
        await mongoose.connect('mongodb://localhost:27017/cyber_threat_db');
        const otps = await OTPVerification.find({}).sort({ createdAt: -1 }).limit(1);
        if (otps.length > 0) {
            const o = otps[0];
            console.log('--- LATEST OTP ---');
            console.log('Email:', o.email);
            console.log('Phone:', o.phone);
            console.log('OTP:', o.otp);
            console.log('Expires At:', o.expires_at);
            console.log('------------------');
        } else {
            console.log('No OTPs found.');
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkOTPs();
