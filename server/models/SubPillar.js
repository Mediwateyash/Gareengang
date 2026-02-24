const mongoose = require('mongoose');

const subPillarSchema = new mongoose.Schema({
    pillarTarget: {
        type: String,
        required: true,
        enum: ['President', 'VP'], // To identify whose section it belongs to
    },
    mediaUrl: {
        type: String,
        required: true,
    },
    cloudinaryId: {
        type: String,
        required: false,
    },
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
    },
    caption: {
        type: String,
        required: true,
        trim: true
    },
    order: {
        type: Number,
        default: 0
    },
    dateAdded: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SubPillar', subPillarSchema);
