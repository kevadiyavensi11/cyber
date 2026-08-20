const mongoose = require('mongoose');

const zoneSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        code: {
            type: String,
            required: false,
        },
        description: {
            type: String,
            required: false,
        },
        polygon: [
            {
                lat: { type: Number, required: true },
                lng: { type: Number, required: true },
            }
        ],
    },
    { timestamps: true }
);

const Zone = mongoose.model('Zone', zoneSchema);
module.exports = Zone;
