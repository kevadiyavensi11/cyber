const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getAllUsers,
    addOfficer,
    updateUser,
    deleteUser,
    toggleUserStatus,
    addCategory,
    deleteReport,
    getDashboardStats,
    getAuditLogs,
    getZones,
    addZone
} = require('../controllers/adminController');
const router = express.Router();

// Only admin can access these routes
router.use(protect);
router.use(authorize('admin'));

router.get('/citizens', getAllUsers);
router.post('/officer/add', addOfficer);
router.put('/user/:id', updateUser);
router.delete('/user/:id', deleteUser);
router.patch('/user-status/:id', toggleUserStatus);
router.post('/category/add', addCategory);
router.delete('/report/:id', deleteReport);
router.get('/dashboard', getDashboardStats);
router.get('/audit-logs', getAuditLogs);
router.get('/zones', getZones);
router.post('/zones', addZone);

module.exports = router;
