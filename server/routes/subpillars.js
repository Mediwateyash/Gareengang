const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const SubPillar = require('../models/SubPillar');

// NOTE: Since the user doesn't have the auth middleware applied to faces or reviews 
// currently (as per previous codebase constraints), we skip it here too to remain consistent, 
// though adding a protect layer is recommended.

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'gareebgang_action_moments',
            resource_type: 'auto',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'mov', 'webm'],
        };
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 15 * 1024 * 1024, // 15MB limit for video support
    }
});

// @route   GET /api/subpillars
// @desc    Get all sub-pillar media
// @access  Public
router.get('/', async (req, res) => {
    try {
        const media = await SubPillar.find().sort('order');
        res.json(media);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/subpillars/:target
// @desc    Get sub-pillar media for a specific target (President or VP)
// @access  Public
router.get('/target/:target', async (req, res) => {
    try {
        const media = await SubPillar.find({ pillarTarget: req.params.target }).sort('order');
        res.json(media);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/subpillars
// @desc    Upload new sub-pillar media
// @access  Private/Admin
router.post('/', upload.single('mediaFile'), async (req, res) => {
    try {
        const { pillarTarget, caption, order } = req.body;

        let mediaUrl = '';
        let cloudinaryId = '';
        let mediaType = 'image';

        if (req.file) {
            mediaUrl = req.file.path;
            cloudinaryId = req.file.filename;

            // Basic detection if the file is a video
            if (req.file.mimetype.startsWith('video/')) {
                mediaType = 'video';
            }
        } else {
            return res.status(400).json({ message: 'Media file is required' });
        }

        const newMedia = new SubPillar({
            pillarTarget,
            caption,
            mediaUrl,
            cloudinaryId,
            mediaType,
            order: order || 0
        });

        const savedMedia = await newMedia.save();
        res.status(201).json(savedMedia);
    } catch (err) {
        console.error('Error creating subpillar media:', err);
        res.status(500).json({ message: err.message || 'Server Error' });
    }
});

// @route   PUT /api/subpillars/bulk/reorder
// @desc    Bulk update media ordering
// @access  Private/Admin
router.put('/bulk/reorder', async (req, res) => {
    try {
        const { media } = req.body; // Array of { id, order }

        if (!media || !Array.isArray(media)) {
            return res.status(400).json({ message: 'Invalid payload' });
        }

        const bulkOps = media.map((item) => ({
            updateOne: {
                filter: { _id: item.id },
                update: { order: item.order }
            }
        }));

        await SubPillar.bulkWrite(bulkOps);

        res.json({ message: 'Ordering updated successfully' });
    } catch (err) {
        console.error('Error reordering subpillars:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/subpillars/:id
// @desc    Update a sub-pillar media (caption/target, or replace file)
// @access  Private/Admin
router.put('/:id', upload.single('mediaFile'), async (req, res) => {
    try {
        const { pillarTarget, caption } = req.body;
        let media = await SubPillar.findById(req.params.id);

        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }

        media.pillarTarget = pillarTarget || media.pillarTarget;
        media.caption = caption || media.caption;

        if (req.file) {
            // Delete old file from Cloudinary if it exists
            if (media.cloudinaryId) {
                // Determine resource type based on stored mediaType
                const resourceType = media.mediaType === 'video' ? 'video' : 'image';
                await cloudinary.uploader.destroy(media.cloudinaryId, { resource_type: resourceType });
            }
            media.mediaUrl = req.file.path;
            media.cloudinaryId = req.file.filename;
            media.mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
        }

        const updatedMedia = await media.save();
        res.json(updatedMedia);
    } catch (err) {
        console.error('Error updating subpillar media:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/subpillars/:id
// @desc    Delete media
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
    try {
        const media = await SubPillar.findById(req.params.id);

        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }

        // Delete from Cloudinary
        if (media.cloudinaryId) {
            const resourceType = media.mediaType === 'video' ? 'video' : 'image';
            await cloudinary.uploader.destroy(media.cloudinaryId, { resource_type: resourceType });
        }

        await media.deleteOne();
        res.json({ message: 'Media removed' });
    } catch (err) {
        console.error('Error deleting subpillar media:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
