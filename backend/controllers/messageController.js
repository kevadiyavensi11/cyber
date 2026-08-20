const Message = require('../models/Message');
const Report = require('../models/Report');

// @desc    Get messages for a report
// @route   GET /api/messages/:reportId
// @access  Private
const getMessages = async (req, res) => {
    try {
        const report = await Report.findById(req.params.reportId);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Security check: Only report owner or assigned officer
        const isOwner = report.createdBy.toString() === req.user._id.toString();
        const isAssigned = report.assignedTo?.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAssigned && !isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const messages = await Message.find({ reportId: req.params.reportId })
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a message
// @route   POST /api/messages
// @access  Private
const createMessage = async (req, res) => {
    const { reportId, message, senderRole } = req.body;
    const senderId = req.user._id;

    try {
        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // SECURITY CHECK
        if (senderRole === 'citizen') {
            if (report.createdBy.toString() !== senderId.toString()) {
                return res.status(403).json({ message: 'Security Alert: You are not the owner of this report.' });
            }
        } else if (senderRole === 'officer') {
            if (report.assignedTo?.toString() !== senderId.toString()) {
                return res.status(403).json({ message: 'Security Alert: You are not assigned to this report.' });
            }
        } else {
            return res.status(400).json({ message: 'Invalid sender role' });
        }

        const newMessage = await Message.create({
            reportId,
            senderId,
            senderRole,
            message
        });

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMessages,
    createMessage,
    uploadChatAttachment: async (req, res) => {
        try {
            if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
            const fileUrl = `http://localhost:5000/uploads/chat/${req.file.filename}`;
            res.json({ fileUrl, fileName: req.file.originalname, mimetype: req.file.mimetype });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    markMessagesAsSeen: async (req, res) => {
        try {
            const { reportId } = req.params;
            const userId = req.user._id;

            await Message.updateMany(
                { reportId, senderId: { $ne: userId }, status: { $ne: 'seen' } },
                { $set: { status: 'seen' } }
            );

            // Emit via socket
            const { getIO } = require('../socket');
            getIO().to(reportId).emit('messagesSeen', { reportId, readerId: userId });

            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};
