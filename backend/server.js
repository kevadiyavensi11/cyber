const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/db');
const socket = require('./socket');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const systemLogRoutes = require('./routes/systemLogRoutes');
const collaborationRoutes = require('./routes/collaborationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const zoneRoutes = require('./routes/zoneRoutes');
const { initCronJobs } = require('./utils/cronJobs');


connectDB().then(() => {
    // Seed zones if none exist
    const Zone = require('./models/Zone');
    Zone.countDocuments({}).then(count => {
        if (count === 0) {
            Zone.insertMany([
                { name: "Central Zone", code: "CZ", polygon: [{ lat: 21.20, lng: 72.80 }, { lat: 21.20, lng: 72.90 }, { lat: 21.10, lng: 72.90 }, { lat: 21.10, lng: 72.80 }], description: "Core city center and administrative hubs." },
                { name: "North Zone", code: "NZ", polygon: [{ lat: 21.30, lng: 72.80 }, { lat: 21.30, lng: 72.90 }, { lat: 21.20, lng: 72.90 }, { lat: 21.20, lng: 72.80 }], description: "Covers North-Central regions." },
                { name: "South Zone", code: "SZ", polygon: [{ lat: 21.10, lng: 72.80 }, { lat: 21.10, lng: 72.90 }, { lat: 21.00, lng: 72.90 }, { lat: 21.00, lng: 72.80 }], description: "Southern residential and commercial districts." },
                { name: "East Zone", code: "EZ", polygon: [{ lat: 21.20, lng: 72.90 }, { lat: 21.20, lng: 73.00 }, { lat: 21.10, lng: 73.00 }, { lat: 21.10, lng: 72.90 }], description: "Eastern industrial corridor." },
                { name: "West Zone", code: "WZ", polygon: [{ lat: 21.20, lng: 72.70 }, { lat: 21.20, lng: 72.80 }, { lat: 21.10, lng: 72.80 }, { lat: 21.10, lng: 72.70 }], description: "Western residential belt." },
                { name: "North-East Zone", code: "NEZ", polygon: [{ lat: 21.30, lng: 72.90 }, { lat: 21.30, lng: 73.00 }, { lat: 21.20, lng: 73.00 }, { lat: 21.20, lng: 72.90 }], description: "Northern-Eastern industrial area." },
                { name: "North-West Zone", code: "NWZ", polygon: [{ lat: 21.30, lng: 72.70 }, { lat: 21.30, lng: 72.80 }, { lat: 21.20, lng: 72.80 }, { lat: 21.20, lng: 72.70 }], description: "Northern-Western regions." },
                { name: "South-East Zone", code: "SEZ", polygon: [{ lat: 21.10, lng: 72.90 }, { lat: 21.10, lng: 73.00 }, { lat: 21.00, lng: 73.00 }, { lat: 21.00, lng: 72.90 }], description: "Southeastern extension." },
                { name: "South-West Zone", code: "SWZ", polygon: [{ lat: 21.10, lng: 72.70 }, { lat: 21.10, lng: 72.80 }, { lat: 21.00, lng: 72.80 }, { lat: 21.00, lng: 72.70 }], description: "Southwestern coastal sectors." }
            ]).then(() => console.log("✅ Seed Data: 9 Directional Zones created successfully"));
        }
    });

    // Initialize Background Monitors
    initCronJobs();
});

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
socket.init(server);

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// API Routes
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/system-logs', systemLogRoutes);
app.use('/api/collaboration', collaborationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/zones', zoneRoutes);


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 [BACKEND] Mission Control active on port ${PORT}`);
    console.log(`💻 [MODE] Development (Hot-Reloading with Nodemon)`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ [PORT CONFLICT] Port ${PORT} is currently occupied by a stale dossier process.`);
        console.error(`💡 [FIX] Run: "netstat -ano | findstr :${PORT}" then "taskkill /PID <ID> /F"`);
        console.error(`⚠️ [CAUTION] Ensure only ONE terminal is running "npm run dev".\n`);
        process.exit(1);
    } else {
        console.error('SERVER ERROR:', err);
    }
});

