const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const SocialLink = require('../models/SocialLink');

// Cloudinary Storage Config
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'gareebgang_socials',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

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
router.post('/', upload.single('imageFile'), async (req, res) => {
    try {
        const { platform, accountName, url, order } = req.body;

        let imageUrl = '';
        let cloudinaryId = '';

        if (req.file) {
            imageUrl = req.file.path;
            cloudinaryId = req.file.filename;
        }

        const newLink = new SocialLink({
            platform,
            accountName,
            url,
            imageUrl,
            cloudinaryId,
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
// @desc    Update a social link (handles optional image update)
// @access  Private/Admin
router.put('/:id', upload.single('imageFile'), async (req, res) => {
    try {
        const { platform, accountName, url } = req.body;
        let link = await SocialLink.findById(req.params.id);

        if (!link) {
            return res.status(404).json({ message: 'Link not found' });
        }

        // If a new file is uploaded, update imageUrl and cloudinaryId
        if (req.file) {
            // Delete old image from Cloudinary if it exists
            if (link.cloudinaryId) {
                try {
                    await cloudinary.uploader.destroy(link.cloudinaryId);
                } catch (cloudinaryErr) {
                    console.error('Error deleting old social image from cloudinary:', cloudinaryErr);
                    // Do not block the update if deletion fails.
                }
            }
            link.imageUrl = req.file.path;
            link.cloudinaryId = req.file.filename;
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

        // Delete image from Cloudinary
        if (link.cloudinaryId) {
            try {
                await cloudinary.uploader.destroy(link.cloudinaryId);
            } catch (err) {
                console.error('Error deleting image from cloudinary:', err);
            }
        }

        await link.deleteOne();
        res.json({ message: 'Link removed' });
    } catch (err) {
        console.error('Error deleting social link:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
