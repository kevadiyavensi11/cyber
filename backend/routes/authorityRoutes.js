const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAllUsers } = require('../controllers/adminController');
const router = express.Router();

router.use(protect);
router.use(authorize('authority'));

router.get('/dashboard', (req, res) => {
    res.json({
        stats: [
            { label: 'Pending Reports', value: '18', trend: 'up', trendValue: '5', color: '#f59e0b' },
            { label: 'In-Review Reports', value: '12', trend: 'up', trendValue: '2', color: '#3b82f6' },
            { label: 'Resolved Reports', value: '145', trend: 'up', trendValue: '24', color: '#10b981' },
            { label: 'Action Center', value: '3', trend: 'down', trendValue: '1', color: '#ef4444' },
        ]
    });
});

router.get('/citizens', getAllUsers);

module.exports = router;
