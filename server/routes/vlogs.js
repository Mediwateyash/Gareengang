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
        let query = {};
        let sort = { date: -1 };

        if (req.query.featured === 'true') {
            query.featured = true;
            sort = { featuredOrder: -1, date: -1 };
        }

        const vlogs = await Vlog.find(query).sort(sort);
        res.json(vlogs);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/vlogs
// @desc    Add a new vlog
router.post('/', async (req, res) => {
    try {
        const { title, videoUrl, category, description, date, featured } = req.body;

        const youtubeId = getYoutubeID(videoUrl);
        if (!youtubeId) {
            return res.status(400).json({ message: 'Invalid YouTube URL' });
        }

        const newVlog = new Vlog({
            title,
            videoUrl,
            youtubeId,
            category,
            description,
            date,
            featured
        });

        const vlog = await newVlog.save();
        res.json(vlog);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// @route   PUT /api/vlogs/:id
// @desc    Update a vlog
router.put('/:id', async (req, res) => {
    try {
        const { title, videoUrl, category, description, featured, featuredOrder } = req.body;

        // Build update object dynamically to only include provided fields
        let updateData = {};
        if (title !== undefined) updateData.title = title;
        if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
        if (category !== undefined) updateData.category = category;
        if (description !== undefined) updateData.description = description;
        if (featured !== undefined) updateData.featured = featured;
        if (featuredOrder !== undefined) updateData.featuredOrder = featuredOrder;

        // If URL changed, update ID
        if (videoUrl) {
            const youtubeId = getYoutubeID(videoUrl);
            if (youtubeId) {
                updateData.youtubeId = youtubeId;
            }
        }

        const vlog = await Vlog.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        res.json(vlog);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
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
