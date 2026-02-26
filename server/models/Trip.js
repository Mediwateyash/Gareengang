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
    section: {
        type: String,
        default: 'Upcoming Trips',
        trim: true
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
    shortDescription: {
        type: String, // For the grid cards
        trim: true
    },
    overview: {
        type: String, // Full rich description on detailed page
        trim: true
    },
    itinerary: [{
        day: { type: Number },
        title: { type: String },
        description: { type: String }
    }],
    budgetBreakdown: [{
        category: { type: String }, // e.g. Transport, Stay, Food
        amount: { type: Number }
    }],
    mapEmbedUrl: {
        type: String, // Iframe src string
        trim: true
    },
    checklist: {
        type: [String], // Array of strings like "Warm clothes", "ID"
        default: []
    },
    gallery: {
        type: [String], // Array of gallery image URLs uploaded via Cloudinary
        default: []
    },
    tripLeaders: [{
        name: { type: String, default: 'Yash Diwate' },
        phone: { type: String, default: '8799903365' },
        instagram: { type: String, default: '' }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
