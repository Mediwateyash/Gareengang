const express = require('express');
const router = express.Router();
const TripCategory = require('../models/TripCategory');

// GET all categories
router.get('/', async (req, res) => {
    try {
        const categories = await TripCategory.find().sort({ createdAt: -1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST a new category
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Category name is required' });

        const existing = await TripCategory.findOne({ name });
        if (existing) return res.status(400).json({ error: 'Category already exists' });

        const newCategory = new TripCategory({ name });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a category
router.delete('/:id', async (req, res) => {
    try {
        await TripCategory.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
