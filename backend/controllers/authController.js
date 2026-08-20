const User = require('../models/User');
const OTPVerification = require('../models/OTPVerification');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const { sendEmailOTP, sendMobileOTP } = require('../utils/commService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    User Login
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // 1. Email Format Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Enter a valid email address' });
    }

    // 2. Find User
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: 'Email not registered' });
    }

    // 3. Status Checks
    if (user.status === 'blocked') {
        return res.status(403).json({ message: 'Account is blocked. Contact Infrastructure Support.' });
    }

    // Officers must be active
    if (user.role === 'officer' && user.status !== 'active') {
        return res.status(403).json({ message: 'Officer account is restricted. Contact System Admin.' });
    }

    // 4. Invalid Password
    // Check if password exists (could be null for Google users who haven't set one)
    if (!user.password) {
        return res.status(401).json({ message: 'This account uses Google Login. Please sign in with Google.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid password' });
    }

    // 5. Respond with token, role, name, id
    res.json({
        token: generateToken(user._id, user.role),
        _id: user._id,
        id: user._id,
        role: user.role,
        name: user.name
    });
};

// @desc    Register a new user (CITIZEN ONLY)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'Email already registered.' });
    }

    // Create Active Citizen (No OTP/Verification required as per Requirement 4)
    const user = await User.create({
        name,
        email,
        password,
        phone,
        role: 'citizen',
        status: 'active'
    });

    if (user) {
        res.status(201).json({
            token: generateToken(user._id, user.role),
            _id: user._id,
            role: user.role,
            name: user.name
        });
    } else {
        res.status(400).json({ message: 'Failed to create user.' });
    }
};

// @desc    Google Login / Sign-up
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
    const { tokenId } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { name, email, picture } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (user) {
            // Check if user is an officer (Officer login with google not allowed)
            if (user.role === 'officer') {
                return res.status(403).json({ message: 'Officers must use Email & Password to login.' });
            }
        } else {
            // Auto-create new citizen
            user = await User.create({
                name,
                email,
                password: null, // Google users don't have a password initially
                status: 'active',
                role: 'citizen'
            });
        }

        res.json({
            token: generateToken(user._id, user.role),
            _id: user._id,
            role: user.role,
            name: user.name
        });
    } catch (error) {
        res.status(400).json({ message: 'Google authentication failed.' });
    }
};

// @desc    Step 1: Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { identifier } = req.body; // Usually email from front-end

    // Requirement: Query users table using the provided email
    const user = await User.findOne({ email: identifier?.toLowerCase() });

    if (!user) {
        return res.status(404).json({ message: 'No registered user found with that email address.' });
    }



    // Generate a secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in otp_verification table/collection with 5min expiry
    await OTPVerification.deleteMany({ email: user.email }); // Clear old ones
    await OTPVerification.create({
        email: user.email,
        phone: user.phone,
        otp,
        expires_at: new Date(Date.now() + 5 * 60 * 1000)
    });

    const emailStatus = await sendEmailOTP(user.email, otp);

    if (!emailStatus.success) {
        return res.status(500).json({ message: 'Failed to dispatch security code to your email. Please check your network connection.' });
    }

    let message = 'OTP sent successfully to your registered email address.';
    if (emailStatus.mode === 'console') {
        message = 'OTP generated successfully (Development Mode: Check Server Console).';
    }

    const maskedEmail = user.email.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => gp1 + gp2.replace(/./g, '*'));

    res.json({
        message,
        sentTo: `Email: ${maskedEmail}`,
    });
};

// @desc    Step 2: Verify Forgot Password OTP
// @route   POST /api/auth/verify-reset-otp
// @access  Public
const verifyResetOTP = async (req, res) => {
    const { identifier, otp } = req.body;

    const verification = await OTPVerification.findOne({
        email: identifier?.toLowerCase(),
        otp
    });

    if (!verification || verification.expires_at < new Date()) {
        return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    res.json({ message: 'OTP verified successfully' });
};

// @desc    Step 3: Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { identifier, otp, newPassword } = req.body;

    const verification = await OTPVerification.findOne({
        email: identifier?.toLowerCase(),
        otp
    });

    if (!verification || verification.expires_at < new Date()) {
        return res.status(400).json({ message: 'Session expired or invalid OTP. Please request a new OTP.' });
    }

    const user = await User.findOne({ email: identifier?.toLowerCase() });

    if (!user) {
        return res.status(404).json({ message: 'User no longer exists.' });
    }

    user.password = newPassword;
    await user.save();

    // Clean up OTP after successful reset
    await OTPVerification.deleteOne({ _id: verification._id });

    res.json({ message: 'Password updated successfully. You can now login.' });
};

// @desc    Get current user profile
const getMe = async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (user) res.json(user);
    else res.status(404).json({ message: 'User not found' });
};

// @desc    Update user profile
const updateMe = async (req, res) => {
    console.log('Update Request Body:', req.body);
    console.log('Update Request File:', req.file);
    const user = await User.findById(req.user._id);
    if (user) {
        console.log('User found:', user.email);
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        // Only update password if provided
        if (req.body.password) {
            console.log('Updating password...');
            user.password = req.body.password;
        }

        // Handle Avatar File
        if (req.file) {
            console.log('New avatar file detected:', req.file.filename);
            // Construct reachable URL
            user.avatar = `http://localhost:5000/uploads/avatars/${req.file.filename}`;
        }

        try {
            const updatedUser = await user.save();
            console.log('User saved successfully');
            res.json({
                token: generateToken(updatedUser._id, updatedUser.role),
                _id: updatedUser._id,
                role: updatedUser.role,
                name: updatedUser.name,
                email: updatedUser.email,
                avatar: updatedUser.avatar
            });
        } catch (saveError) {
            console.error('Database Save Error:', saveError);
            res.status(500).json({ message: 'Database sync failed: ' + saveError.message });
        }
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    googleLogin,
    forgotPassword,
    verifyResetOTP,
    resetPassword,
    getMe,
    updateMe
};

