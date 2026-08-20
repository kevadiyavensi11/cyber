const express = require('express');
const {
    sendMessage,
    getChatHistory,
    requestInfo
} = require('../controllers/collaborationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../utils/uploadUtils');
const router = express.Router();

router.use(protect);

router.post('/message', sendMessage);
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    res.json({
        url: fileUrl,
        filename: req.file.originalname,
        fileType: req.file.mimetype
    });
});
router.get('/history/:reportId', getChatHistory);
router.post('/request-info', authorize('officer'), requestInfo);

module.exports = router;
