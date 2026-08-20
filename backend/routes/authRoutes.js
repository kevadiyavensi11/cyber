const express = require('express');
const multer = require('multer');
const path = require('path');
const {
    registerUser,
    loginUser,
    googleLogin,
    forgotPassword,
    verifyResetOTP,
    resetPassword,
    getMe,
    updateMe
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Multer Config for Avatars
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/avatars')),
    filename: (req, file, cb) => cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('avatar'), updateMe);

module.exports = router;
