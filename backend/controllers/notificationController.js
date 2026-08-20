const Notification = require('../models/Notification');
const { getIO } = require('../socket');
const User = require('../models/User');
const { createLog } = require('./systemLogController');


// @desc    Send notification
// @route   POST /api/notifications/send
// @access  Private (Admin/Officer)
const sendNotification = async (req, res) => {
    const { title, message, userId, role, type, broadcast } = req.body;

    try {
        if (broadcast) {
            // Normalize role target
            const targetRole = role?.toLowerCase();
            const query = targetRole === 'all' ? {} : { role: targetRole };

            const users = await User.find(query);
            console.log(`[Broadcast] Targeting ${targetRole}, found ${users.length} users`);

            if (users.length > 0) {
                const notifications = users.map(user => ({
                    userId: user._id,
                    role: user.role,
                    title,
                    message,
                    type: type || 'system',
                }));

                await Notification.insertMany(notifications);

                // Emit via socket
                try {
                    const io = getIO();
                    if (targetRole === 'all') {
                        io.emit('broadcastNotification', { title, message, type: type || 'system' });
                    } else {
                        io.to(`role:${targetRole}`).emit('newNotification', {
                            title,
                            message,
                            type: type || 'system',
                            createdAt: new Date()
                        });
                    }
                } catch (socketErr) {
                    console.error('Socket emission failed during broadcast:', socketErr.message);
                    // Don't fail the whole request if only socket failed
                }

                // System Log
                createLog({
                    level: 'info',
                    category: 'BROADCAST',
                    message: `${req.user.role.toUpperCase()} ${req.user.name} issued broadcast: ${title}`,
                    userId: req.user._id,
                    metadata: { targetRole, recipientCount: users.length, type }
                });
            }

            return res.status(201).json({
                message: 'Broadcast processed',
                recipientCount: users.length
            });
        }


        const notification = await Notification.create({
            userId,
            role,
            title,
            message,
            type,
        });

        // Emit real-time notification
        const io = getIO();
        io.to(userId.toString()).emit('newNotification', notification);

        res.status(201).json(notification);
    } catch (error) {
        console.error('Send Notification Error:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get received notifications for a specific user
// @route   GET /api/notifications/user/:id
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.params.id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/mark-read/:id
// @access  Private
const markRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.read = true;
        await notification.save();

        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark all notifications as read for a user
// @route   PATCH /api/notifications/mark-all-read/:id
// @access  Private
const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.params.id, read: false },
            { $set: { read: true } }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count/:id
// @access  Private
const countUnread = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            userId: req.params.id,
            read: false,
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    sendNotification,
    getNotifications,
    markRead,
    markAllRead,
    countUnread,
};

