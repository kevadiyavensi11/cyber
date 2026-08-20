const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String },
        phone: { type: String },
        otp: { type: String },
        otpExpiry: { type: Date },
        role: {
            type: String,
            enum: ['admin', 'officer', 'citizen'],
            default: 'citizen',
        },
        status: {
            type: String,
            enum: ['active', 'verified', 'blocked', 'inactive'],
            default: 'active',
        },
        zone: {
            type: String,
            enum: [
                "Central",
                "North",
                "South",
                "East",
                "West",
                "North-East",
                "North-West",
                "South-East",
                "South-West"
            ],
        },
        isActive: {
            type: Boolean,
            default: true
        },
        assignedReportsCount: {
            type: Number,
            default: 0
        },
        avatar: {
            type: String,
            default: ''
        }
    },
    { timestamps: true }
);

// Optimize officer auto-assignment query
userSchema.index({ zone: 1, assignedReportsCount: 1 });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
