const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary Storage for Trips
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'gareebgang_trips', // Store trips separately from faces
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for high-res hero banners
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// @route   POST /api/trips
// @desc    Create a new trip
// @access  Public (Should be protected by auth ideally)
router.post('/', upload.single('coverImage'), async (req, res) => {
    try {
        if (!req.file && !req.body.coverImage) {
            return res.status(400).json({ message: 'Cover Image is required' });
        }

        // Parse complex JSON fields sent via FormData
        const parsedItinerary = req.body.itinerary ? JSON.parse(req.body.itinerary) : [];
        const parsedBudgetBreakdown = req.body.budgetBreakdown ? JSON.parse(req.body.budgetBreakdown) : [];
        const parsedChecklist = req.body.checklist ? JSON.parse(req.body.checklist) : [];
        const parsedGallery = req.body.gallery ? JSON.parse(req.body.gallery) : [];
        const parsedTripLeader = req.body.tripLeader ? JSON.parse(req.body.tripLeader) : undefined;

        const tripData = {
            ...req.body,
            itinerary: parsedItinerary,
            budgetBreakdown: parsedBudgetBreakdown,
            checklist: parsedChecklist,
            gallery: parsedGallery,
            ...(parsedTripLeader && { tripLeader: parsedTripLeader }),
            coverImage: req.file ? req.file.path : req.body.coverImage
        };

        const trip = new Trip(tripData);
        await trip.save();
        res.status(201).json(trip);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   GET /api/trips
// @desc    Get all trips
// @access  Public
router.get('/', async (req, res) => {
    try {
        const trips = await Trip.find().sort({ createdAt: -1 });
        res.json(trips);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/trips/:id
// @desc    Get a single trip by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        res.json(trip);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT /api/trips/:id
// @desc    Update a trip
// @access  Public (Should be protected by auth)
router.put('/:id', upload.single('coverImage'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.coverImage = req.file.path;
        }

        // Parse complex JSON fields
        if (req.body.itinerary) updateData.itinerary = JSON.parse(req.body.itinerary);
        if (req.body.budgetBreakdown) updateData.budgetBreakdown = JSON.parse(req.body.budgetBreakdown);
        if (req.body.checklist) updateData.checklist = JSON.parse(req.body.checklist);
        if (req.body.gallery) updateData.gallery = JSON.parse(req.body.gallery);
        if (req.body.tripLeader) updateData.tripLeader = JSON.parse(req.body.tripLeader);

        const trip = await Trip.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        res.json(trip);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   DELETE /api/trips/:id
// @desc    Delete a trip
// @access  Public (Should be protected by auth)
router.delete('/:id', async (req, res) => {
    try {
        const trip = await Trip.findByIdAndDelete(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        res.json({ message: 'Trip deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
