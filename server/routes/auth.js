const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register Standard User
router.post('/register', async (req, res) => {
    const { name, phone, password } = req.body;

    try {
        if (!name || !phone || !password) {
            return res.status(400).json({ message: 'Name, phone number, and password are required' });
        }

        const userExists = await User.findOne({ phone });
        if (userExists) {
            return res.status(400).json({ message: 'An account with this phone number already exists' });
        }

        const user = await User.create({ name, phone, password, role: 'visitor' });
        res.status(201).json({
            message: 'Registered successfully',
            user: { id: user._id, name: user.name, phone: user.phone, role: user.role, image: user.image }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login (Standard User via Phone, or Admin via Username)
router.post('/login', async (req, res) => {
    const { loginId, password } = req.body; // loginId can be phone or username

    try {
        const user = await User.findOne({
            $or: [{ phone: loginId }, { username: loginId }]
        });

        if (user && user.password === password) {
            res.json({
                message: 'Login successful',
                user: { id: user._id, name: user.name || user.username, phone: user.phone, role: user.role, image: user.image }
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
