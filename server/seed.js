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
};

module.exports = seedData;

