const mongoose = require('mongoose');
const Report = require('../models/Report');
const { createReport } = require('../controllers/reportController');
require('dotenv').config();

const simulateControllerCreate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");

    const req = {
        user: { _id: new mongoose.Types.ObjectId('69ca42d877762cd9a1cdbc24'), role: 'citizen' },
        body: {
            threatTitle: "Synthetic Controller Test",
            description: "Testing saving logic directly via controller.",
            threatType: "Malware Infection",
            severity: "High",
            zone: "North"
        },
        file: null,
        socket: { remoteAddress: '127.0.0.1' },
        headers: {}
    };

    const res = {
        status: (code) => ({
            json: (data) => {
                console.log(`Status ${code} received:`, data.threatTitle);
            }
        }),
        json: (data) => {
            console.log("Response JSON received:", data.threatTitle);
        }
    };

    await createReport(req, res);
    
    // Wait a bit for background tasks
    setTimeout(async () => {
        const found = await Report.findOne({ threatTitle: "Synthetic Controller Test" });
        if (found) {
            console.log("✅ Report found in DB with SLA Deadline:", found.slaDeadline);
            await Report.deleteOne({ _id: found._id });
        } else {
            console.log("❌ Report NOT found in DB!");
        }
        await mongoose.disconnect();
        process.exit(0);
    }, 5000);

  } catch (error) {
    console.error("Simulation failed:", error.message);
    process.exit(1);
  }
};

simulateControllerCreate();
