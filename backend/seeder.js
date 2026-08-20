const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Report = require('./models/Report');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany();
        await Report.deleteMany();

        // 1. Create Admin
        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@cyber.com',
            password: 'admin123',
            role: 'admin',
        });

        // 2. Create Officer
        const officer = await User.create({
            name: 'Cyber Officer 1',
            email: 'officer@cyber.com',
            password: 'officer123',
            role: 'officer',
        });

        // 3. Create Citizens
        const citizen1 = await User.create({
            name: 'John Citizen',
            email: 'john@citizen.com',
            password: 'password123',
            role: 'citizen',
        });

        const citizen2 = await User.create({
            name: 'Jane Citizen',
            email: 'jane@citizen.com',
            password: 'password123',
            role: 'citizen',
        });

        // 4. Create Reports
        await Report.create({
            threatTitle: 'Unauthorized Bank Transaction',
            threatType: 'Fraud',
            description: 'Someone accessed my bank account and transferred 50,000 INR.',
            urlOrPhone: '0987654321',
            severity: 'High',
            status: 'Pending',
            ipAddress: '192.168.1.1',
            createdBy: citizen1._id,
            timeline: [{ status: 'Pending', message: 'Report submitted by citizen', timestamp: new Date() }]
        });

        await Report.create({
            threatTitle: 'Phishing Email Attack',
            threatType: 'Phishing',
            description: 'Received a suspicious email asking for login credentials of government portal.',
            urlOrPhone: 'http://fake-govt.com',
            severity: 'Medium',
            status: 'Investigating',
            ipAddress: '172.16.0.45',
            createdBy: citizen2._id,
            assignedTo: officer._id,
            timeline: [
                { status: 'Pending', message: 'Report submitted by citizen', timestamp: new Date() },
                { status: 'Investigating', message: 'Assigned to Cyber Officer 1', timestamp: new Date() }
            ]
        });

        await Report.create({
            threatTitle: 'System Malware Infection',
            threatType: 'Malware',
            description: 'My computer is showing ransomware messages.',
            severity: 'Critical',
            status: 'Resolved',
            ipAddress: '10.0.0.5',
            createdBy: citizen1._id,
            assignedTo: officer._id,
            timeline: [
                { status: 'Pending', message: 'Report submitted by citizen', timestamp: new Date() },
                { status: 'Investigating', message: 'Evidence being reviewed', timestamp: new Date() },
                { status: 'Resolved', message: 'Threat mitigated and steps shared', timestamp: new Date() }
            ]
        });

        console.log('✅ Cyber Threat Reporting System Seed Successful');
        process.exit();
    } catch (error) {
        console.error(`❌ Error during seeding: ${error.message}`);
        process.exit(1);
    }
};

seedData();
