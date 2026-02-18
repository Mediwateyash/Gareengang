const mongoose = require('mongoose');

const MemorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String
    },
    category: {
        type: String,
        default: 'Uncategorized'
    },
    caption: {
        type: String
    },
    image: {
        type: String, // URL to the image
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    featuredOrder: {
        type: Number,
        default: 0
    },
    // --- Detail Page Fields ---
    story: {
        type: String, // Long text for the full story
        default: ''
    },
    gallery: [{
        url: { type: String, required: true },
        likes: { type: Number, default: 0 },
        comments: [{
            text: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }]
    }],
    people: [{
        type: String // Array of names
    }],
    relatedVlogUrl: {
        type: String, // Optional YouTube link
        default: ''
    },
    highlights: [{
        title: String,
        description: String,
        icon: String // Emoji or icon class
    }],
    reactions: {
        heart: { type: Number, default: 0 },
        laugh: { type: Number, default: 0 },
        cry: { type: Number, default: 0 },
        fire: { type: Number, default: 0 }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Memory', MemorySchema);
