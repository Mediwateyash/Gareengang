const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// GET all categories (Populated)
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().populate('memories').sort({ createdAt: -1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new category
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Category Name is required' });

        const newCategory = new Category({ name, memories: [] });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Category already exists' });
        }
        res.status(500).json({ message: err.message });
    }
});

// PUT update category memories (Order & Content)
router.put('/:id', async (req, res) => {
    try {
        console.log(`[PUT Category] ID: ${req.params.id}`);
        console.log(`[PUT Category] Body:`, req.body);
        const { memories } = req.body; // Expect array of IDs
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        if (memories) category.memories = memories;
        await category.save();

        // Return populated category for immediate UI update
        const updated = await Category.findById(req.params.id).populate('memories');
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE category

// DELETE category
router.delete('/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
