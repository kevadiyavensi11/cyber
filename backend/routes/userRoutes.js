const express = require('express');
const { getAllUsers } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/all', protect, authorize('admin', 'officer'), getAllUsers);

module.exports = router;
