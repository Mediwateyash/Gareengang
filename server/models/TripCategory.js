const mongoose = require('mongoose');

const tripCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('TripCategory', tripCategorySchema);
