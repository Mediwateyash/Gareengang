const express = require('express');
const router = express.Router();
const Face = require('../models/Face');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'gareebgang_faces',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        };
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// @route   GET /api/faces
// @desc    Get all faces
// @access  Public
router.get('/', async (req, res) => {
    try {
        const faces = await Face.find().sort({ order: 1, createdAt: -1 });
        res.json(faces);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/faces
// @desc    Create a face
// @access  Private/Admin
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file && !req.body.imageUrl) {
            return res.status(400).json({ message: 'Image is required' });
        }

        const { name, uniqueTrait, order } = req.body;

        const newFace = new Face({
            name,
            uniqueTrait,
            imageUrl: req.file ? req.file.path : req.body.imageUrl,
            cloudinaryId: req.file && req.file.filename ? req.file.filename : (req.body.cloudinaryId || ''),
            order: order || 0
        });

        const face = await newFace.save();
        res.json(face);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/faces/reorder
// @desc    Bulk update face ordering
// @access  Private/Admin
router.put('/bulk/reorder', async (req, res) => {
    try {
        const { faces } = req.body; // Array of { id: '...', order: 0 }
        if (!faces || !Array.isArray(faces)) {
            return res.status(400).json({ message: 'Faces array is required' });
        }

        const bulkOps = faces.map((face) => ({
            updateOne: {
                filter: { _id: face.id },
                update: { order: face.order }
            }
        }));

        await Face.bulkWrite(bulkOps);
        res.json({ message: 'Order updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/faces/:id
// @desc    Update a face
// @access  Private/Admin
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        let face = await Face.findById(req.params.id);

        if (!face) {
            return res.status(404).json({ message: 'Face not found' });
        }

        const { name, uniqueTrait, order } = req.body;

        // Construct update object
        const faceFields = {
            name: name || face.name,
            uniqueTrait: uniqueTrait || face.uniqueTrait,
            order: order !== undefined ? order : face.order
        };

        // If file is uploaded, update image.
        if (req.file) {
            // Delete old image from Cloudinary if it exists
            if (face.cloudinaryId && face.cloudinaryId !== '') {
                try {
                    await cloudinary.uploader.destroy(face.cloudinaryId);
                } catch (cloudinaryErr) {
                    console.error("Failed to delete old image from Cloudinary:", cloudinaryErr);
                }
            }
            faceFields.imageUrl = req.file.path;
            faceFields.cloudinaryId = req.file.filename;
        }

        face = await Face.findByIdAndUpdate(
            req.params.id,
            { $set: faceFields },
            { new: true }
        );

        res.json(face);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/faces/:id
// @desc    Delete a face
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
    try {
        const face = await Face.findById(req.params.id);

        if (!face) {
            return res.status(404).json({ message: 'Face not found' });
        }

        // Delete image from Cloudinary
        if (face.cloudinaryId && face.cloudinaryId !== '') {
            try {
                await cloudinary.uploader.destroy(face.cloudinaryId);
            } catch (cloudinaryErr) {
                console.error("Failed to delete image from Cloudinary:", cloudinaryErr);
            }
        }

        await Face.findByIdAndDelete(req.params.id);

        res.json({ message: 'Face removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Face not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
