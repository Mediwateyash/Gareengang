const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    stats: {
        trips: { type: Number, default: 0 },
        cities: { type: Number, default: 0 },
        memories: { type: Number, default: 0 },
        years: { type: Number, default: 0 }
    }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
