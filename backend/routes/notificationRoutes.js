const express = require('express');
const router = express.Router();
const {
    sendNotification,
    getNotifications,
    markRead,
    markAllRead,
    countUnread,
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/send', protect, authorize('admin', 'officer'), sendNotification);
router.get('/user/:id', protect, getNotifications);
router.patch('/mark-read/:id', protect, markRead);
router.patch('/mark-all-read/:id', protect, markAllRead);
router.get('/unread-count/:id', protect, countUnread);

module.exports = router;

