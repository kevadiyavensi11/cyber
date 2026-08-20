const mongoose = require('mongoose');

const otpVerificationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true
    },
    phone: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    expires_at: {
        type: Date,
        required: true,
        index: { expires: 0 } // Automatically delete document at exactly expires_at time
    }
}, { timestamps: true });

const OTPVerification = mongoose.model('OTPVerification', otpVerificationSchema);

module.exports = OTPVerification;
