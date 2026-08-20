const mongoose = require('mongoose');
const Report = require('./models/Report');
const User = require('./models/User');
const Message = require('./models/Message');
const Notification = require('./models/Notification');
const SystemLog = require('./models/SystemLog');

// Mock req object
const req = {
    params: { id: '69a943a8f6f5741987eb8799' },
    body: {
        status: 'Resolved with Fine',
        resolutionSummary: 'Official authority finalized the dossier as Resolved with Fine.'
    },
    user: {
        _id: '69a470574d40903a093d6c68', // Officer neel
        name: 'neel',
        role: 'officer'
    }
};

const res = {
    status: function (code) {
        this.statusCode = code;
        return this;
    },
    json: function (data) {
        console.log('RESPONSE_CODE:', this.statusCode || 200);
        console.log('RESPONSE_DATA:', JSON.stringify(data, null, 2));
    }
};

async function test() {
    try {
        await mongoose.connect('mongodb://localhost:27017/cyber_threat_db');

        // Load the logic from reportController or copy it here for a quick test
        const { updateReportStatus } = require('./controllers/reportController');

        console.log('--- STARTING BACKEND LOGIC TEST ---');
        await updateReportStatus(req, res);
        console.log('--- TEST FINISHED ---');

        await mongoose.disconnect();
    } catch (err) {
        console.error('CRITICAL TEST ERROR:', err);
    }
}

test();
