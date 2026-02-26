const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   GET /api/users
// @desc    Get all users for Admin Panel
// @access  Public (in production, should be protected by JWT Admin guard)
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error("Fetch Users Error:", err);
        res.status(500).json({ message: 'Server error fetching users' });
    }
});

// @route   GET /api/users/profile/:id
// @desc    Get user profile with populated relations
// @access  Public (in production, should be protected by JWT)
router.get('/profile/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('likedMemories')
            .populate({
                path: 'myBookings',
                populate: { path: 'tripId', select: 'title coverImage dates status' }
            })
            // .populate('myComments') // Implement later if Comments model added
            .select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error("Profile Fetch Error:", err);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
});

// @route   PUT /api/users/role/:id
// @desc    Update user role (visitor -> member -> admin)
// @access  Protected (Admin only ideally)
router.put('/role/:id', async (req, res) => {
    try {
        const { role } = req.body;
        if (!['visitor', 'member', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error("Role Update Error:", err);
        res.status(500).json({ message: 'Server error updating role' });
    }
});

// @route   PUT /api/users/profile/:id
// @desc    Update user profile data (name, phone)
// @access  Protected (User themselves physically logged in)
router.put('/profile/:id', async (req, res) => {
    try {
        const { name, phone } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone; // Allow emptying out the phone number voluntarily

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error("Profile Edit Error:", err);
        res.status(500).json({ message: 'Server error updating profile' });
    }
});

module.exports = router;
