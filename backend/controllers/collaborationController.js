const Message = require('../models/Message');
const Report = require('../models/Report');
const AuditLog = require('../models/AuditLog');
const socket = require('../socket');

// @desc    Send a message in a case
// @route   POST /api/collaboration/message
// @access  Private
const sendMessage = async (req, res) => {
    const { reportId, content, type, attachments } = req.body;

    try {
        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Access Control: Only sender, assigned officer, or admin
        const isCitizen = report.createdBy.toString() === req.user._id.toString();
        const isOfficer = report.assignedTo?.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isCitizen && !isOfficer && !isAdmin) {
            return res.status(403).json({ message: 'Access denied: You are not authorized to message in this case.' });
        }

        const message = await Message.create({
            reportId,
            senderId: req.user._id,
            senderRole: req.user.role,
            message: content
        });

        // Audit Logging
        await AuditLog.create({
            userId: req.user._id,
            action: 'SEND_MESSAGE',
            entity: 'Message',
            entityId: message._id,
            details: { reportId, type },
            ipAddress: req.ip
        });

        // Broadcast via Socket.IO
        const io = socket.getIO();
        io.to(reportId).emit('newMessage', {
            ...message._doc,
            sender: { _id: req.user._id, name: req.user.name, role: req.user.role }
        });

        // Send notification to the other party
        const recipientRoom = isCitizen ? report.assignedTo?.toString() : report.createdBy.toString();
        if (recipientRoom) {
            io.to(recipientRoom).emit('notification', {
                type: 'NEW_MESSAGE',
                message: `New message in Case #${reportId.toString().slice(-6).toUpperCase()}`,
                reportId
            });
        }

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get chat history for a case
// @route   GET /api/collaboration/history/:reportId
// @access  Private
const getChatHistory = async (req, res) => {
    try {
        const report = await Report.findById(req.params.reportId);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Access Control
        const isCitizen = report.createdBy.toString() === req.user._id.toString();
        const isOfficer = report.assignedTo?.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isCitizen && !isOfficer && !isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const messages = await Message.find({ reportId: req.params.reportId })
            .populate('senderId', 'name role')
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Officer requests evidence/info from Citizen
// @route   POST /api/collaboration/request-info
// @access  Private (Officer only)
const requestInfo = async (req, res) => {
    const { reportId, content } = req.body;

    try {
        const report = await Report.findById(reportId);
        if (!report || report.assignedTo?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized or invalid report' });
        }

        const message = await Message.create({
            reportId,
            senderId: req.user._id,
            senderRole: 'officer',
            message: content
        });

        // Update Timeline
        report.timeline.push({
            title: 'Information Requested',
            description: content,
            role: 'officer'
        });
        await report.save();

        // Audit 
        await AuditLog.create({
            userId: req.user._id,
            action: 'REQUEST_INFO',
            entity: 'Report',
            entityId: reportId,
            details: { content },
            ipAddress: req.ip
        });

        const io = socket.getIO();
        io.to(reportId).emit('newMessage', message);
        io.to(report.createdBy.toString()).emit('notification', {
            type: 'INFO_REQUESTED',
            message: `Officer ${req.user.name} requested more information.`,
            reportId
        });

        res.json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    sendMessage,
    getChatHistory,
    requestInfo
};
