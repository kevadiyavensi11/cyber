 const SystemLog = require('../models/SystemLog');

const getSystemLogs = async (req, res) => {
    try {
        const logs = await SystemLog.find()
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('userId', 'name role');
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createLog = async ({ level, category, message, userId, metadata }) => {
    try {
        await SystemLog.create({
            level: level || 'info',
            category,
            message,
            userId,
            metadata
        });
    } catch (err) {
        console.error('System Log Failed:', err.message);
    }
};

module.exports = {
    getSystemLogs,
    createLog
};
