const express = require('express');
const {
    getAdminStats,
    getOfficerStats,
    getCitizenStats
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/admin-stats', protect, authorize('admin'), getAdminStats);
router.get('/officer-stats/:id', protect, authorize('officer', 'admin'), getOfficerStats);
router.get('/citizen-stats/:id', protect, authorize('citizen', 'admin'), getCitizenStats);

module.exports = router;
