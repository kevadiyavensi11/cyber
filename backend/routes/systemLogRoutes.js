const express = require('express');
const router = express.Router();
const { getSystemLogs } = require('../controllers/systemLogController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin'), getSystemLogs);

module.exports = router;
