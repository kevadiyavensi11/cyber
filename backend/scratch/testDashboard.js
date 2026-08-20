const mongoose = require('mongoose');
const Report = require('../models/Report');
const User = require('../models/User');
require('dotenv').config();

const testDashboard = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");

    const stats = {
        totalCitizens: await User.countDocuments({ role: 'citizen' }),
        totalOfficers: await User.countDocuments({ role: 'officer' }),
        totalReports: await Report.countDocuments({}),
        breachedSlaCount: await Report.countDocuments({ slaStatus: 'BREACHED', isClosed: { $ne: true } })
    };

    console.log("✅ Dashboard Stats Success:", stats);
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Dashboard Logic Failed:", error.message);
  }
};

testDashboard();
