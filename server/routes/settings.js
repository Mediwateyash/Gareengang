const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// GET settings
router.get('/', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            // Initialize if not exists
            settings = new Settings({
                stats: { trips: 18, cities: 7, memories: 42, years: 3 }
            });
            await settings.save();
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE settings
router.put('/', async (req, res) => {
    try {
        const { stats } = req.body;
        let settings = await Settings.findOne();

        if (!settings) {
            settings = new Settings({ stats });
        } else {
            settings.stats = stats;
        }

        await settings.save();
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
