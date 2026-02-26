const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String, // Optional for admin backward compatibility
        unique: true,
        sparse: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    image: {
        type: String,
        default: 'https://via.placeholder.com/150', // Default avatar
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    likedMemories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Memory'
    }],
    myBookings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Registration'
    }],
    myComments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
