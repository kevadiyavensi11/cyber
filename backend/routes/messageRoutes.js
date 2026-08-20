const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getMessages, createMessage, uploadChatAttachment, markMessagesAsSeen } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/chat';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `chat-${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
        const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mime = allowedTypes.test(file.mimetype);
        if (ext && mime) cb(null, true);
        else cb(new Error('Only Images (JPG/PNG), PDFs and DOCs are allowed'));
    }
});

router.use(protect);

router.get('/:reportId', getMessages);
router.post('/', createMessage);
router.post('/upload', upload.single('file'), uploadChatAttachment);
router.put('/seen/:reportId', markMessagesAsSeen);

module.exports = router;
