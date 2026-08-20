const mongoose = require('mongoose');

const officerSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String },
        role: {
            type: String,
            default: 'officer'
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
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        assignedReportsCount: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enum: ['active', 'blocked', 'verified', 'inactive'],
            default: 'active'
        }
    },
    { timestamps: true }
);

// Optimize officer auto-assignment query
officerSchema.index({ zone: 1, assignedReportsCount: 1 });

// We point it to the 'users' collection so it shares the data with the User model
const Officer = mongoose.model('Officer', officerSchema, 'users');
module.exports = Officer;
