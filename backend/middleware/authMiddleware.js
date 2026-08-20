const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            if (req.user.status === 'blocked') {
                return res.status(403).json({ message: 'User is blocked' });
            }

            return next();
        } catch (error) {
            console.error('Token verification failed:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        // Normalize roles to lowercase for comparison
        let userRole = req.user.role.toLowerCase();
        if (userRole === 'authority') userRole = 'officer';

        const allowedRoles = roles.map(r => {
            let role = r.toLowerCase();
            if (role === 'authority') role = 'officer';
            return role;
        });

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                message: `403 Forbidden - Access Denied for role: ${userRole}`,
            });
        }

        next();
    };
};

module.exports = { protect, authorize };
