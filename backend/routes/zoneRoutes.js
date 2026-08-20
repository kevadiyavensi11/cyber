const express = require('express');
const router = express.Router();
const Zone = require('../models/Zone');

// @desc    Get all zones
// @route   GET /api/zones
// @access  Public
router.get('/', async (req, res) => {
    try {
        const zones = await Zone.find({});
        res.json(zones);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
