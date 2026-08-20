const mongoose = require('mongoose');
const Report = require('../models/Report');
const User = require('../models/User');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/dashboard/admin-stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        const totalCitizens = await User.countDocuments({ role: 'citizen' });
        const totalOfficers = await User.countDocuments({ role: 'officer' });
        const totalReports = await Report.countDocuments({});
        const pendingReports = await Report.countDocuments({ status: 'Pending' });
        const resolvedReports = await Report.countDocuments({ status: { $in: ['Resolved', 'Resolved with Fine', 'Case Closed'] } });
        const breachedSlaCount = await Report.countDocuments({ slaStatus: 'BREACHED', isClosed: { $ne: true } });

        // Severity Chart Data
        const severityData = await Report.aggregate([
            { $group: { _id: "$severity", count: { $sum: 1 } } }
        ]);

        // Threat Type Chart Data
        const threatTypeData = await Report.aggregate([
            { $group: { _id: "$threatType", count: { $sum: 1 } } }
        ]);

        res.json({
            stats: [
                { label: 'Total Citizens', value: totalCitizens.toString(), trend: 'up', trendValue: '12', color: '#3b82f6', iconName: 'Users' },
                { label: 'Total Officers', value: totalOfficers.toString(), trend: 'up', trendValue: '4', color: '#10b981', iconName: 'ShieldCheck' },
                { label: 'Total Reports', value: totalReports.toString(), trend: 'up', trendValue: '18', color: '#f59e0b', iconName: 'Database' },
                { label: 'Resolved Cases', value: resolvedReports.toString(), trend: 'up', trendValue: '25', color: '#0ea5e9', iconName: 'Activity' },
                { label: 'SLA Breaches', value: breachedSlaCount.toString(), trend: 'down', trendValue: 'high', color: '#ef4444', iconName: 'AlertTriangle' },
                {
                    label: 'Fines Collected',
                    value: `₹${(await Report.aggregate([{ $match: { paymentStatus: 'Paid' } }, { $group: { _id: null, total: { $sum: "$fineAmount" } } }]))[0]?.total || 0}`,
                    trend: 'up',
                    trendValue: 'new',
                    color: '#10b981',
                    iconName: 'CreditCard'
                },
            ],
            charts: {
                severity: severityData,
                threatTypes: threatTypeData,
            },
            raw: { totalCitizens, totalOfficers, totalReports, pendingReports, resolvedReports }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Officer Dashboard Stats
// @route   GET /api/dashboard/officer-stats/:id
// @access  Private/Officer
const getOfficerStats = async (req, res) => {
    try {
        const officerId = req.params.id;
        const officerObjectId = new mongoose.Types.ObjectId(officerId);
        const assignedReports = await Report.countDocuments({ assignedTo: officerObjectId });
        const pending = await Report.countDocuments({ assignedTo: officerObjectId, status: 'Pending' });
        const investigating = await Report.countDocuments({ assignedTo: officerObjectId, status: { $in: ['Investigating', 'Reopened', 'Under Investigation'] } });
        const resolved = await Report.countDocuments({
            status: { $in: ['Resolved', 'Resolved with Fine', 'Case Closed'] }
        });
        const breachedSlaCount = await Report.countDocuments({ 
            assignedTo: officerObjectId, 
            slaStatus: 'BREACHED', 
            isClosed: { $ne: true } 
        });

        res.json({
            stats: [
                { label: 'Assigned Cases', value: assignedReports.toString(), color: '#3b82f6', iconName: 'Briefcase' },
                { label: 'Pending', value: pending.toString(), color: '#f59e0b', iconName: 'Clock' },
                { label: 'In Progress', value: investigating.toString(), color: '#0ea5e9', iconName: 'Shield' },
                { label: 'SLA Breached', value: breachedSlaCount.toString(), color: '#ef4444', iconName: 'AlertTriangle' },
                { label: 'Resolved', value: resolved.toString(), color: '#10b981', iconName: 'CheckCircle' },
            ],
            raw: { assignedReports, pending, investigating, resolved }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Citizen Dashboard Stats
// @route   GET /api/dashboard/citizen-stats/:id
// @access  Private/Citizen
const getCitizenStats = async (req, res) => {
    try {
        const citizenId = req.params.id;
        const citizenObjectId = new mongoose.Types.ObjectId(citizenId);
        const myReports = await Report.countDocuments({ createdBy: citizenObjectId });
        const pending = await Report.countDocuments({ createdBy: citizenObjectId, status: 'Pending' });
        const investigating = await Report.countDocuments({ createdBy: citizenObjectId, status: { $in: ['Investigating', 'Reopened', 'Under Investigation', 'Assigned', 'Verified'] } });
        const resolved = await Report.countDocuments({
            createdBy: citizenObjectId,
            status: { $in: ['Resolved', 'Resolved with Fine', 'Case Closed'] }
        });
        const pendingFines = await Report.countDocuments({
            createdBy: citizenObjectId,
            $or: [
                { paymentStatus: 'Pending' },
                { status: 'Resolved with Fine', paymentStatus: { $ne: 'Paid' } }
            ]
        });

        // System-wide Zone Distribution
        const zoneDistribution = await Report.aggregate([
            { $group: { _id: "$zone", count: { $sum: 1 } } }
        ]);

        // System-wide Threat Type Distribution
        const threatTypeDistribution = await Report.aggregate([
            { $group: { _id: "$threatType", count: { $sum: 1 } } }
        ]);

        res.json({
            stats: [
                { label: 'My Submissions', value: myReports.toString(), color: '#3b82f6', iconName: 'Send' },
                { label: 'Pending', value: pending.toString(), color: '#f59e0b', iconName: 'Search' },
                { label: 'Investigating', value: investigating.toString(), color: '#0ea5e9', iconName: 'Shield' },
                { label: 'Resolved', value: resolved.toString(), color: '#10b981', iconName: 'Bell' },
                { label: 'Pending Fines', value: pendingFines.toString(), color: '#ef4444', iconName: 'CreditCard' },
            ],
            charts: {
                zones: zoneDistribution.map(z => ({ name: z._id, value: z.count })),
                threatTypes: threatTypeDistribution.map(t => ({ name: t._id, value: t.count }))
            },
            raw: { myReports, pending, investigating, resolved }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAdminStats,
    getOfficerStats,
    getCitizenStats
};
