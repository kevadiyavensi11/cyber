const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Report = require('./backend/models/Report');

dotenv.config({ path: './backend/.env' });

const checkReports = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const reports = await Report.find({});
        console.log(`Total Reports: ${reports.length}`);

        reports.forEach((r, i) => {
            console.log(`\nReport ${i + 1}:`);
            console.log(`  ID: ${r._id}`);
            console.log(`  Title: ${r.threatTitle}`);
            console.log(`  Status: "${r.status}"`);
            console.log(`  PayStat: "${r.paymentStatus}"`);
            console.log(`  CreatedBy: ${r.createdBy}`);
            console.log(`  Severity: ${r.severity}`);
        });

        const distinctPaymentStatuses = await Report.distinct('paymentStatus');
        console.log(`\nDistinct Payment Statuses: ${JSON.stringify(distinctPaymentStatuses)}`);

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkReports();
