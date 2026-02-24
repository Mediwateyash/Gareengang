const mongoose = require('mongoose');

const socialLinkSchema = new mongoose.Schema({
    platform: {
        type: String,
        required: true,
        enum: ['Instagram', 'YouTube', 'Facebook', 'Other'],
        default: 'Instagram'
    },
    accountName: {
        type: String,
        required: true,
        trim: true
    },
    url: {
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

module.exports = mongoose.model('SocialLink', socialLinkSchema);
