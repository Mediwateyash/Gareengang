const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// @route   GET /api/reviews
// @desc    Get all video reviews
// @access  Public
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ order: 1, dateAdded: -1 });
        res.json(reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/reviews
// @desc    Create a video review
// @access  Private/Admin
router.post('/', async (req, res) => {
    try {
        const { name, role, youtubeUrl, order } = req.body;

        if (!name || !role || !youtubeUrl) {
            return res.status(400).json({ message: 'Name, role, and YouTube URL are required' });
        }

        const newReview = new Review({
            name,
            role,
            youtubeUrl,
            order: order || 0
        });

        const review = await newReview.save();
        res.json(review);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/reviews/bulk/reorder
// @desc    Bulk update review ordering
// @access  Private/Admin
router.put('/bulk/reorder', async (req, res) => {
    try {
        const { reviews } = req.body; // Array of { id: '...', order: 0 }

        if (!reviews || !Array.isArray(reviews)) {
            return res.status(400).json({ message: 'Reviews array is required' });
        }

        const bulkOps = reviews.map((review) => ({
            updateOne: {
                filter: { _id: review.id },
                update: { order: review.order }
            }
        }));

        await Review.bulkWrite(bulkOps);
        res.json({ message: 'Order updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private/Admin
router.put('/:id', async (req, res) => {
    try {
        let review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const { name, role, youtubeUrl, order } = req.body;

        const reviewFields = {
            name: name || review.name,
            role: role || review.role,
            youtubeUrl: youtubeUrl || review.youtubeUrl,
            order: order !== undefined ? order : review.order
        };

        review = await Review.findByIdAndUpdate(
            req.params.id,
            { $set: reviewFields },
            { new: true }
        );

        res.json(review);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        await Review.findByIdAndDelete(req.params.id);

        res.json({ message: 'Review removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
