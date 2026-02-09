const mongoose = require('mongoose');

const VlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    videoUrl: {
        type: String, // Full YouTube URL
        required: true
    },
    youtubeId: {
        type: String, // Extracted ID for thumbnails
        required: true
    },
    category: {
        type: String,
        enum: ['Trip', 'Event', 'Fun', 'Other'],
        default: 'Other'
    },
    date: {
        type: Date,
        default: Date.now
    },
    featured: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Vlog', VlogSchema);
