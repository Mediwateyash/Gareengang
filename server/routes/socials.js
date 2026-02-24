const express = require('express');
const router = express.Router();
const SocialLink = require('../models/SocialLink');

// @route   GET /api/socials
// @desc    Get all social links
// @access  Public
router.get('/', async (req, res) => {
    try {
        const links = await SocialLink.find().sort('order');
        res.json(links);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/socials
// @desc    Add a new social link
// @access  Private/Admin
router.post('/', async (req, res) => {
    try {
        const { platform, accountName, url, order } = req.body;

        const newLink = new SocialLink({
            platform,
            accountName,
            url,
            order: order || 0
        });

        const savedLink = await newLink.save();
        res.status(201).json(savedLink);
    } catch (err) {
        console.error('Error creating social link:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/socials/bulk/reorder
// @desc    Bulk update link ordering
// @access  Private/Admin
router.put('/bulk/reorder', async (req, res) => {
    try {
        const { links } = req.body; // Array of { id, order }

        if (!links || !Array.isArray(links)) {
            return res.status(400).json({ message: 'Invalid payload' });
        }

        const bulkOps = links.map((item) => ({
            updateOne: {
                filter: { _id: item.id },
                update: { order: item.order }
            }
        }));

        await SocialLink.bulkWrite(bulkOps);

        res.json({ message: 'Ordering updated successfully' });
    } catch (err) {
        console.error('Error reordering social links:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/socials/:id
// @desc    Update a social link
// @access  Private/Admin
router.put('/:id', async (req, res) => {
    try {
        const { platform, accountName, url } = req.body;
        let link = await SocialLink.findById(req.params.id);

        if (!link) {
            return res.status(404).json({ message: 'Link not found' });
        }

        link.platform = platform || link.platform;
        link.accountName = accountName || link.accountName;
        link.url = url || link.url;

        const updatedLink = await link.save();
        res.json(updatedLink);
    } catch (err) {
        console.error('Error updating social link:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/socials/:id
// @desc    Delete a social link
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
    try {
        const link = await SocialLink.findById(req.params.id);

        if (!link) {
            return res.status(404).json({ message: 'Link not found' });
        }

        await link.deleteOne();
        res.json({ message: 'Link removed' });
    } catch (err) {
        console.error('Error deleting social link:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
