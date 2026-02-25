const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    destination: {
        type: String,
        required: true,
        trim: true
    },
    dateDisplay: {
        type: String,
        required: true, // e.g. "12/3/26" or "Upcoming Summer"
        trim: true
    },
    status: {
        type: String,
        enum: ['Booking Open', 'Coming Soon', 'Completed', 'Cancelled'],
        default: 'Coming Soon'
    },
    bookingFee: {
        type: Number,
        default: 50 // Advance slot amount in INR
    },
    totalSlots: {
        type: Number,
        default: 20
    },
    bookedSlots: {
        type: Number,
        default: 0
    },
    coverImage: {
        type: String, // Banner image for the slider
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    itinerary: {
        type: [String], // Array of daily plans or features
        default: []
    },
    galleryReferenceLink: {
        type: String, // Link to external album or internal memory ID if status is 'Completed'
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
