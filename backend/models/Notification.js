const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        role: {
            type: String,
            enum: ['citizen', 'officer', 'admin'],
            required: true
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: {
            type: String,
            enum: ['system', 'warning', 'update', 'assignment'],
            required: true
        },
        read: {
            type: Boolean,
            default: false
        },
        reportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Report'
        }
    },
    { timestamps: true }
);


const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
