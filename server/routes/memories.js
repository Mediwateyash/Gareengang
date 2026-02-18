const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
// const fs = require('fs'); // Not needed for Cloudinary
const Memory = require('../models/Memory');

const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'gareebgang',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        };
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// @route   GET /api/memories
// @desc    Get all memories
router.get('/', async (req, res) => {
    try {
        const memories = await Memory.find().sort({ date: -1 });
        res.json(memories);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/memories/featured
// @desc    Get featured memories
router.get('/featured', async (req, res) => {
    try {
        const memories = await Memory.find({ featured: true }).sort({ featuredOrder: -1, date: -1 }).limit(3);
        res.json(memories);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/memories/:id
// @desc    Get a single memory by ID
router.get('/:id', async (req, res) => {
    try {
        const memory = await Memory.findById(req.params.id);
        if (!memory) return res.status(404).json({ message: 'Memory not found' });
        res.json(memory);
    } catch (err) {
        if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Memory not found' });
        res.status(500).json({ message: 'Server Error' });
    }
});

// Helper to normalize gallery items to objects
const normalizeGallery = (items) => {
    return items.map(item => {
        if (typeof item === 'string') {
            return { url: item, likes: 0, comments: [] };
        }
        return item;
    });
};

// @route   POST /api/memories
// @desc    Create a new memory (with optional file upload)
router.post('/', upload.fields([{ name: 'imageFile', maxCount: 1 }, { name: 'galleryFiles', maxCount: 50 }]), async (req, res) => {
    try {
        const {
            title, date, location, caption, image, featured, featuredOrder,
            story, gallery, people, relatedVlogUrl, highlights
        } = req.body;

        // Determine image source
        let imagePath = image;
        if (req.files && req.files['imageFile']) {
            imagePath = req.files['imageFile'][0].path;
        }

        if (!imagePath) return res.status(400).json({ message: 'Image is required' });

        // Parse JSON fields
        const parseJSON = (field) => {
            if (typeof field === 'string') {
                try { return JSON.parse(field); } catch (e) { return []; }
            }
            return field || [];
        };

        let galleryPaths = parseJSON(gallery);

        // Add uploaded gallery images
        if (req.files && req.files['galleryFiles']) {
            const uploadedGallery = req.files['galleryFiles'].map(file => file.path);
            galleryPaths = [...galleryPaths, ...uploadedGallery];
        }

        // Convert all gallery items to objects
        const galleryObjects = normalizeGallery(galleryPaths);

        const newMemory = new Memory({
            title, date, location, caption,
            image: imagePath,
            featured: featured === 'true',
            featuredOrder: featuredOrder || 0,
            story: story || '',
            gallery: galleryObjects,
            people: parseJSON(people),
            relatedVlogUrl: relatedVlogUrl || '',
            highlights: parseJSON(highlights)
        });

        const memory = await newMemory.save();
        res.json(memory);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// @route   PUT /api/memories/:id
// @desc    Update a memory
router.put('/:id', upload.fields([{ name: 'imageFile', maxCount: 1 }, { name: 'galleryFiles', maxCount: 50 }]), async (req, res) => {
    try {
        const {
            title, date, location, caption, image, featured, featuredOrder,
            story, gallery, people, relatedVlogUrl, highlights
        } = req.body;

        let memory = await Memory.findById(req.params.id);
        if (!memory) return res.status(404).json({ msg: 'Memory not found' });

        // Update basic fields
        if (title) memory.title = title;
        if (date) memory.date = date;
        if (location) memory.location = location;
        if (caption) memory.caption = caption;
        if (featured !== undefined) memory.featured = featured === 'true';
        if (featuredOrder !== undefined) memory.featuredOrder = parseInt(featuredOrder);

        // Update detail fields
        if (story !== undefined) memory.story = story;
        if (relatedVlogUrl !== undefined) memory.relatedVlogUrl = relatedVlogUrl;

        const parseJSON = (field) => {
            if (typeof field === 'string') {
                try { return JSON.parse(field); } catch (e) { return null; }
            }
            return field;
        };

        // Handle Gallery Update
        let currentGallery = memory.gallery || [];

        // If gallery URLs are sent (preserving existing ones or adding new URLs)
        if (gallery) {
            const parsedGallery = parseJSON(gallery);
            if (parsedGallery) {
                // If it's a mix of objects (existing) and strings (new/legacy), normalize only strings
                // However, simpler to just re-normalize everything if we trust the input structure
                // But wait, existing objects have IDs, likes, comments. We shouldn't crush them.
                // Strategy: If input is string, make new object. If object, keep it.
                currentGallery = normalizeGallery(parsedGallery);
            }
        }

        // Add new uploaded files to gallery
        if (req.files && req.files['galleryFiles']) {
            const uploadedGallery = req.files['galleryFiles'].map(file => file.path);
            const newObjects = normalizeGallery(uploadedGallery);
            currentGallery = [...currentGallery, ...newObjects];
        }

        memory.gallery = currentGallery;

        if (people) { const p = parseJSON(people); if (p) memory.people = p; }
        if (highlights) { const h = parseJSON(highlights); if (h) memory.highlights = h; }

        // Update main image if new file uploaded
        if (req.files && req.files['imageFile']) {
            memory.image = req.files['imageFile'][0].path;
        } else if (image) {
            memory.image = image;
        }

        await memory.save();
        res.json(memory);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/memories/:id
// @desc    Delete a memory
router.delete('/:id', async (req, res) => {
    try {
        const memory = await Memory.findById(req.params.id);

        if (!memory) return res.status(404).json({ msg: 'Memory not found' });

        // Optional: Delete physical file if it exists and is local
        // const filePath = path.join(__dirname, '../../client/public', memory.image);
        // if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await Memory.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Memory removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/memories/:id/gallery/:itemId/like
// @desc    Like a gallery image
router.post('/:id/gallery/:itemId/like', async (req, res) => {
    try {
        const memory = await Memory.findById(req.params.id);
        if (!memory) return res.status(404).json({ msg: 'Memory not found' });

        const item = memory.gallery.id(req.params.itemId);
        if (!item) return res.status(404).json({ msg: 'Image not found' });

        item.likes += 1;
        await memory.save();
        res.json(memory);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/memories/:id/gallery/:itemId/comment
// @desc    Comment on a gallery image
router.post('/:id/gallery/:itemId/comment', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ msg: 'Text is required' });

        const memory = await Memory.findById(req.params.id);
        if (!memory) return res.status(404).json({ msg: 'Memory not found' });

        const item = memory.gallery.id(req.params.itemId);
        if (!item) return res.status(404).json({ msg: 'Image not found' });

        item.comments.push({ text });
        await memory.save();
        res.json(memory);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
