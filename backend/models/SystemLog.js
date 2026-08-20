const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema(
    {
        level: {
            type: String,
            enum: ['info', 'warn', 'error', 'critical'],
            default: 'info'
        },
        category: {
            type: String,
            required: true // e.g., 'AUTH', 'REPORT', 'ASSIGNMENT', 'SYSTEM'
        },
        message: {
            type: String,
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        ipAddress: String,
        userAgent: String,
        metadata: Object
    },
    { timestamps: true }
);

module.exports = mongoose.model('SystemLog', systemLogSchema);
