const mongoose = require('mongoose');
const Report = require('../models/Report');
require('dotenv').config();

const testSave = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");

    const reportData = {
      threatTitle: "Test SLA Report",
      threatType: "Phishing Attack",
      description: "Test description for SLA validation",
      severity: "High",
      zone: "Central",
      createdBy: new mongoose.Types.ObjectId(), // Fake ID
      slaStartTime: new Date(),
      slaDeadline: new Date(),
      slaStatus: "ON_TIME"
    };

    const report = new Report(reportData);
    const saved = await report.save();
    console.log("✅ Report Saved Successfully:", saved._id);
    
    // Cleanup
    await Report.deleteOne({ _id: saved._id });
    console.log("Cleaned up.");
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Save Failed:", error.message);
    if (error.errors) {
       console.log("Validation Errors:", Object.keys(error.errors));
    }
  }
};

testSave();
