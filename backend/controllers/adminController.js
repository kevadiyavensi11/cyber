const User = require('../models/User');
const Report = require('../models/Report');
const Category = require('../models/Category');
const Zone = require('../models/Zone');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
};

// @desc    Add a new officer
// @route   POST /api/admin/officer/add
// @access  Private (Admin)
const addOfficer = async (req, res) => {
    const { name, email, password, zone } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
        name,
        email,
        password,
        role: 'officer',
        zone, // directional zone string
        isActive: true,
        status: 'active'
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            zone: user.zone,
        });
    } else {
        res.status(400).json({ message: 'Invalid officer data' });
    }
};

// @desc    Delete a user
// @route   DELETE /api/admin/user/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot delete admin account' });
        }
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Add a new category
// @route   POST /api/admin/category/add
// @access  Private (Admin)
const addCategory = async (req, res) => {
    const { name } = req.body;

    const categoryExists = await Category.findOne({ name });

    if (categoryExists) {
        return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({ name });

    if (category) {
        res.status(201).json(category);
    } else {
        res.status(400).json({ message: 'Invalid category data' });
    }
};

// @desc    Delete a report
// @route   DELETE /api/admin/report/:id
// @access  Private (Admin)
const deleteReport = async (req, res) => {
    const report = await Report.findById(req.params.id);

    if (report) {
        await report.deleteOne();
        res.json({ message: 'Report removed' });
    } else {
        res.status(404).json({ message: 'Report not found' });
    }
};

// @desc    Update user details
// @route   PUT /api/admin/user/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.password) user.password = req.body.password;
            if (req.body.zone) user.zone = req.body.zone;
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                status: updatedUser.status,
                zone: updatedUser.zone,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Toggle user status (Block/Active)
// @route   PATCH /api/admin/user-status/:id
// @access  Private (Admin)
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            if (user.role === 'admin') {
                return res.status(403).json({ message: 'Cannot block admin account' });
            }
            // Normalize status if it doesn't exist (handle legacy records)
            const currentStatus = user.status || 'active';
            user.status = currentStatus === 'active' ? 'blocked' : 'active';
            user.isActive = user.status === 'active';
            await user.save();
            res.json({ message: `User ${user.status === 'active' ? 'activated' : 'blocked'} successfully`, status: user.status });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get dashboard analytics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
    try {
        const totalCitizens = await User.countDocuments({ role: 'citizen' });
        const totalOfficers = await User.countDocuments({ role: 'officer' });
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const totalReports = await Report.countDocuments({});
        const pendingReports = await Report.countDocuments({ status: 'Pending' });

        const recentReports = await Report.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('createdBy', 'name');

        res.json({
            stats: [
                { label: 'Total Citizens', value: totalCitizens.toString(), trend: 'up', trendValue: '12', color: '#3b82f6', iconName: 'Users' },
                { label: 'Total Officers', value: totalOfficers.toString(), trend: 'up', trendValue: '4', color: '#10b981', iconName: 'ShieldCheck' },
                { label: 'Total Admins', value: totalAdmins.toString(), trend: 'up', trendValue: '1', color: '#6366f1', iconName: 'ShieldPlus' },
                { label: 'Total Reports', value: totalReports.toString(), trend: 'up', trendValue: '18', color: '#f59e0b', iconName: 'Database' },
            ],
            recentReports
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const AuditLog = require('../models/AuditLog');

// @desc    Get system audit logs
// @route   GET /api/admin/audit-logs
// @access  Private (Admin)
const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find({})
            .populate('userId', 'name role')
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all zones
// @route   GET /api/admin/zones
// @access  Private (Admin)
const getZones = async (req, res) => {
    try {
        const zones = await Zone.find({});
        res.json(zones);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new zone
// @route   POST /api/admin/zones
// @access  Private (Admin)
const addZone = async (req, res) => {
    try {
        const { name, polygon } = req.body;
        const zoneExists = await Zone.findOne({ name });
        if (zoneExists) {
            return res.status(400).json({ message: 'Zone already exists' });
        }
        const zone = await Zone.create({ name, polygon });
        res.status(201).json(zone);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
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
};
