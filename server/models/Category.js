const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    memories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Memory'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Category', CategorySchema);
