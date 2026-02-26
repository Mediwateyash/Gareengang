const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // This will allow us to query comments attached to either a Trip OR a Memory
    },
    targetModel: {
        type: String,
        required: true,
        enum: ['Trip', 'Memory']
    },
    text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    }
}, { timestamps: true });

// Prevent a user from spamming identical comments on the exact same post
commentSchema.index({ user: 1, targetId: 1, text: 1 }, { unique: true });

module.exports = mongoose.model('Comment', commentSchema);
