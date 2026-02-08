const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Memory = require('../models/Memory');

// Configure Multer Storage (Store directly in client/public/uploads/memories)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../client/public/uploads/memories');
        // Ensure directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Create unique filename: memory-{timestamp}-{random}.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'memory-' + uniqueSuffix + ext);
    }
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
        const memories = await Memory.find({ featured: true }).sort({ date: -1 }).limit(3);
        res.json(memories);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/memories
// @desc    Create a new memory (with optional file upload)
router.post('/', upload.single('imageFile'), async (req, res) => {
    // Note: 'imageFile' is the form field name for the file
    // 'image' field in req.body might contain a URL string if no file is uploaded (fallback/edit)

    try {
        const { title, date, location, caption, image, featured } = req.body;

        // Determine image source: Uploaded file OR URL string
        let imagePath = image; // Default to URL if provided

        if (req.file) {
            // If file uploaded, use the relative path accessible from public folder
            imagePath = `/uploads/memories/${req.file.filename}`;
        }

        // Validate that we have some image source
        if (!imagePath) {
            return res.status(400).json({ message: 'Image is required (File upload or URL)' });
        }

        const newMemory = new Memory({
            title,
            date,
            location,
            caption,
            image: imagePath,
            featured: featured === 'true' // FormData sends booleans as strings
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
router.put('/:id', upload.single('imageFile'), async (req, res) => {
    try {
        const { title, date, location, caption, image, featured } = req.body;

        let memory = await Memory.findById(req.params.id);
        if (!memory) return res.status(404).json({ msg: 'Memory not found' });

        // Update fields
        if (title) memory.title = title;
        if (date) memory.date = date;
        if (location) memory.location = location;
        if (caption) memory.caption = caption;
        if (featured) memory.featured = featured === 'true';

        // Update image if new file uploaded
        if (req.file) {
            memory.image = `/uploads/memories/${req.file.filename}`;
            // Optional: Delete old image if it was a local file to save space
        } else if (image) {
            // Allow updating to a URL string if explicitly provided
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

module.exports = router;
