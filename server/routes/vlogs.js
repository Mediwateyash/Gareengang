const express = require('express');
const router = express.Router();
const Vlog = require('../models/Vlog');

// Helper to extract YouTube ID
const getYoutubeID = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// @route   GET /api/vlogs
// @desc    Get all vlogs
router.get('/', async (req, res) => {
    try {
        const vlogs = await Vlog.find().sort({ date: -1 });
        res.json(vlogs);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/vlogs
// @desc    Add a new vlog
router.post('/', async (req, res) => {
    try {
        const { title, videoUrl, category, date, featured } = req.body;

        const youtubeId = getYoutubeID(videoUrl);
        if (!youtubeId) {
            return res.status(400).json({ message: 'Invalid YouTube URL' });
        }

        const newVlog = new Vlog({
            title,
            videoUrl,
            youtubeId,
            category,
            date,
            featured
        });

        const vlog = await newVlog.save();
        res.json(vlog);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// @route   DELETE /api/vlogs/:id
// @desc    Delete a vlog
router.delete('/:id', async (req, res) => {
    try {
        await Vlog.findByIdAndDelete(req.params.id);
        res.json({ message: 'Vlog removed' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
