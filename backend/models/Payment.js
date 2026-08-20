const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema(
    {
        reportId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Report'
        },
        citizenId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        category: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            required: true,
            enum: ['Pending', 'Paid'],
            default: 'Pending'
        },
        transactionId: {
            type: String
        },
        paymentDate: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Payment', paymentSchema);
