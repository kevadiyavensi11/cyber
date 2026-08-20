const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
    {
        reportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Report',
            required: true,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        senderRole: {
            type: String,
            enum: ['citizen', 'officer', 'system'],
            required: true,
        },
        message: {
            type: String,
        },
        fileUrl: {
            type: String,
        },
        fileName: {
            type: String,
        },
        messageType: {
            type: String,
            enum: ['text', 'image', 'file'],
            default: 'text'
        },
        status: {
            type: String,
            enum: ['sent', 'delivered', 'seen'],
            default: 'sent'
        }
    },
    { timestamps: true }
);

// Index for faster lookups per report
messageSchema.index({ reportId: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
