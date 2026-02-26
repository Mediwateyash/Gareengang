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

module.exports = router;
