const Notification = require('../models/Notification');
const { getIO } = require('../socket');

const createNotification = async ({ userId, role, title, message, type, reportId }) => {
    try {
        const notification = await Notification.create({
            userId,
            role,
            title,
            message,
            type,
            reportId
        });


        const io = getIO();
        io.to(userId.toString()).emit('newNotification', notification);
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

module.exports = { createNotification };

