const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
router.use(authorize('citizen'));

router.get('/dashboard', (req, res) => {
    res.json({
        stats: [
            { label: 'My Submissions', value: '4', trend: 'up', trendValue: '1', color: '#3b82f6' },
            { label: 'In Review', value: '2', trend: 'neutral', trendValue: '0', color: '#f59e0b' },
            { label: 'Resolved', value: '2', trend: 'up', trendValue: '1', color: '#10b981' },
            { label: 'Unread Alerts', value: '5', trend: 'up', trendValue: '2', color: '#ef4444' },
        ]
    });
});

module.exports = router;
