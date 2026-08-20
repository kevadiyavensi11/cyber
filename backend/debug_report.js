const mongoose = require('mongoose');
const Report = require('./models/Report');

async function check() {
    try {
        await mongoose.connect('mongodb://localhost:27017/cyber_threat_db');
        const report = await Report.findById('69a943a8f6f5741987eb8799');
        console.log('REPORT_DATA_START');
        console.log(JSON.stringify(report, null, 2));
        console.log('REPORT_DATA_END');
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

check();
