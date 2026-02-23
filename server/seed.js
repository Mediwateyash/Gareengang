const mongoose = require('mongoose');
const User = require('./models/User');
const Face = require('./models/Face');

const seedData = async () => {
    // Seed Admins
    const admins = [
        { username: 'dagdu@kingmaker', password: 'aniketcstkijai' },
        { username: 'yashdiwate', password: '25699652' }
    ];

    for (const admin of admins) {
        const exists = await User.findOne({ username: admin.username });
        if (!exists) {
            await User.create(admin);
            console.log(`Admin created: ${admin.username}`);
        } else {
            console.log(`Admin already exists: ${admin.username}`);
        }
    }

    // Seed Initial Faces (only if DB is empty to prevent duplicates on restart)
    const faceCount = await Face.countDocuments();
    if (faceCount === 0) {
        const initialFaces = [
            { name: "John Doe", uniqueTrait: "The Innovator", imageUrl: "https://via.placeholder.com/150", cloudinaryId: "" },
            { name: "Jane Smith", uniqueTrait: "The Strategist", imageUrl: "https://via.placeholder.com/150", cloudinaryId: "" },
            { name: "Sam Wilson", uniqueTrait: "The Visionary", imageUrl: "https://via.placeholder.com/150", cloudinaryId: "" },
            { name: "Emily Brown", uniqueTrait: "The Executor", imageUrl: "https://via.placeholder.com/150", cloudinaryId: "" },
            { name: "Michael Johnson", uniqueTrait: "The Problem Solver", imageUrl: "https://via.placeholder.com/150", cloudinaryId: "" },
        ];
        await Face.insertMany(initialFaces);
        console.log('Seeded 5 initial faces.');
    } else {
        console.log('Faces already seeded.');
    }

    // Seed Initial Video Reviews
    try {
        const Review = require('./models/Review');
        const reviewCount = await Review.countDocuments();
        if (reviewCount === 0) {
            const initialReviews = [
                { name: 'Rahul Sharma', role: 'Community Member', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', order: 0 },
                { name: 'Priya Patel', role: 'Student Alumni', youtubeUrl: 'https://www.youtube.com/watch?v=y6120QOlsfU', order: 1 },
                { name: 'Amit Kumar', role: 'Volunteer', youtubeUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw', order: 2 },
            ];
            await Review.insertMany(initialReviews);
            console.log('Seeded 3 initial video reviews.');
        } else {
            console.log('Video Reviews already seeded.');
        }
    } catch (err) {
        console.error('Error seeding reviews:', err);
    }
};

module.exports = seedData;

