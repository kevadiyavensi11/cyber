const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Zone = require('./models/Zone');

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cyber_threat');
        console.log(`Connected to Database: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const directionalZones = [
    {
        name: "North-West Zone",
        code: "NWZ",
        polygon: [
            { lat: 21.30, lng: 72.70 },
            { lat: 21.30, lng: 72.80 },
            { lat: 21.20, lng: 72.80 },
            { lat: 21.20, lng: 72.70 }
        ],
        description: "Covers Northern-Western regions of the metropolitan area."
    },
    {
        name: "North Zone",
        code: "NZ",
        polygon: [
            { lat: 21.30, lng: 72.80 },
            { lat: 21.30, lng: 72.90 },
            { lat: 21.20, lng: 72.90 },
            { lat: 21.20, lng: 72.80 }
        ],
        description: "Covers North-Central regions and northern residential colonies."
    },
    {
        name: "North-East Zone",
        code: "NEZ",
        polygon: [
            { lat: 21.30, lng: 72.90 },
            { lat: 21.30, lng: 73.00 },
            { lat: 21.20, lng: 73.00 },
            { lat: 21.20, lng: 72.90 }
        ],
        description: "Covers Northern-Eastern industrial and developing areas."
    },
    {
        name: "West Zone",
        code: "WZ",
        polygon: [
            { lat: 21.20, lng: 72.70 },
            { lat: 21.20, lng: 72.80 },
            { lat: 21.10, lng: 72.80 },
            { lat: 21.10, lng: 72.70 }
        ],
        description: "Covers the western residential belt."
    },
    {
        name: "Central Zone",
        code: "CZ",
        polygon: [
            { lat: 21.20, lng: 72.80 },
            { lat: 21.20, lng: 72.90 },
            { lat: 21.10, lng: 72.90 },
            { lat: 21.10, lng: 72.80 }
        ],
        description: "Core city center and administrative hubs."
    },
    {
        name: "East Zone",
        code: "EZ",
        polygon: [
            { lat: 21.20, lng: 72.90 },
            { lat: 21.20, lng: 73.00 },
            { lat: 21.10, lng: 73.00 },
            { lat: 21.10, lng: 72.90 }
        ],
        description: "Covers the eastern industrial corridor."
    },
    {
        name: "South-West Zone",
        code: "SWZ",
        polygon: [
            { lat: 21.10, lng: 72.70 },
            { lat: 21.10, lng: 72.80 },
            { lat: 21.00, lng: 72.80 },
            { lat: 21.00, lng: 72.70 }
        ],
        description: "Covers the southwestern coastal and industrial sectors."
    },
    {
        name: "South Zone",
        code: "SZ",
        polygon: [
            { lat: 21.10, lng: 72.80 },
            { lat: 21.10, lng: 72.90 },
            { lat: 21.00, lng: 72.90 },
            { lat: 21.00, lng: 72.80 }
        ],
        description: "Southern residential and commercial districts."
    },
    {
        name: "South-East Zone",
        code: "SEZ",
        polygon: [
            { lat: 21.10, lng: 72.90 },
            { lat: 21.10, lng: 73.00 },
            { lat: 21.00, lng: 73.00 },
            { lat: 21.00, lng: 72.90 }
        ],
        description: "Southeastern extension and developing outskirts."
    }
];

const seedZones = async () => {
    await connectDB();
    try {
        await Zone.deleteMany();
        console.log('Old zones purged');

        await Zone.insertMany(directionalZones);
        console.log('Directional zones seeded successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedZones();
