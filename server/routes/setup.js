const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Memory = require('../models/Memory');

const memories = [
    { date: "2024-03-10", title: "Farmhouse Day-Out (Boys)", location: "GareebGang Farmhouse", caption: "Boys day out! Full on masti.", image: "https://images.unsplash.com/photo-1566419806659-5b7967b57574?q=80&w=2699&auto=format&fit=crop" },
    { date: "2024-04-08", title: "Annual Function", location: "College Campus", caption: "Celebrating our annual function together.", image: "https://images.unsplash.com/photo-1514525253440-b393452e3383?q=80&w=2600&auto=format&fit=crop" },
    { date: "2024-06-19", title: "Imagica Day-Out", location: "Imagica Theme Park", caption: "Thrilling rides and endless fun.", image: "https://images.unsplash.com/photo-1513883049090-d0b7439799bf?q=80&w=2670&auto=format&fit=crop" },
    { date: "2024-07-10", title: "Bhivpuri Waterfall (Trip 1)", location: "Bhivpuri", caption: "First trip to Bhivpuri waterfall.", image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=80&w=2670&auto=format&fit=crop" },
    { date: "2024-08-31", title: "Chintamani Ganpati Aagman", location: "Chintamani Pandal", caption: "Welcoming Chintamani Bappa.", image: "https://images.unsplash.com/photo-1567591414240-e7471017cb25?q=80&w=2670&auto=format&fit=crop" },
    { date: "2024-09-28", title: "Boys Farmhouse", location: "Farmhouse", caption: "Another memorable boys' trip.", image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2669&auto=format&fit=crop" },
    { date: "2024-12-21", title: "Daman Trip", location: "Daman", caption: "Chill vibes at Daman beach.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2673&auto=format&fit=crop" },
    { date: "2025-03-15", title: "Stay Farmhouse (Everyone)", location: "Farmhouse", caption: "Full squad at the farmhouse!", image: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?q=80&w=2670&auto=format&fit=crop" },
    { date: "2025-06-22", title: "Farmhouse Trip", location: "Farmhouse", caption: "Summer vibes at the farmhouse.", image: "https://images.unsplash.com/photo-1566419806659-5b7967b57574?q=80&w=2699&auto=format&fit=crop" },
    { date: "2025-07-09", title: "Random Day-Out", location: "City", caption: "Just a random, fun day out.", image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2669&auto=format&fit=crop" },
    { date: "2025-07-08", title: "Random Day-Out ft Jurassic Park Movie", location: "Cinema", caption: "Movie time: Jurassic Park!", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2670&auto=format&fit=crop" },
    { date: "2025-07-12", title: "Bhivpuri Waterfall (Trip 2)", location: "Bhivpuri", caption: "Back to Bhivpuri for round 2.", image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=80&w=2670&auto=format&fit=crop" },
    { date: "2025-07-21", title: "Turf with Boys (Turf 1)", location: "Turf Ground", caption: "Cricket match with the boys.", image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2667&auto=format&fit=crop" },
    { date: "2025-07-29", title: "Turf with Boys (Turf 2)", location: "Turf Ground", caption: "Second turf game, getting competitive.", image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2667&auto=format&fit=crop" },
    { date: "2025-08-05", title: "Peb Fort Trek", location: "Peb Fort", caption: "Trekking adventure to Peb Fort.", image: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2670&auto=format&fit=crop" },
    { date: "2025-08-29", title: "Ganpati Visit at Ankita & Aditya’s Home", location: "Ankita & Aditya's Home", caption: "Seeking blessings.", image: "https://images.unsplash.com/photo-1567591414240-e7471017cb25?q=80&w=2670&auto=format&fit=crop" },
    { date: "2025-09-12", title: "Random Day-Out at KFC", location: "KFC", caption: "Chicken buckets and good conversations.", image: "https://images.unsplash.com/photo-1513639776629-c261c66e2e0f?q=80&w=2670&auto=format&fit=crop" },
    { date: "2025-09-15", title: "Mumbai Day-Out", location: "Mumbai", caption: "Exploring the city of dreams.", image: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?q=80&w=2565&auto=format&fit=crop" },
    { date: "2025-09-21", title: "Pune Trip", location: "Pune", caption: "Weekend getaway to Pune.", image: "https://images.unsplash.com/photo-1588416936097-41850ab3d86d?q=80&w=2574&auto=format&fit=crop" },
    { date: "2025-09-28", title: "Abhang Repost Memory", location: "Social Media", caption: "Reliving memories through Abhang's post.", image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2574&auto=format&fit=crop" },
    { date: "2025-12-30", title: "Barvi Dam Visit", location: "Barvi Dam", caption: "Serene views at Barvi Dam.", image: "https://images.unsplash.com/photo-1549887534-1541e9326642?q=80&w=2670&auto=format&fit=crop" },
    { date: "2025-12-17", title: "Ujjain Trip", location: "Ujjain", caption: "Spiritual journey to Ujjain.", image: "https://images.unsplash.com/photo-1596305634673-8df8b9b8b0bb?q=80&w=2535&auto=format&fit=crop" },
    { date: "2026-01-24", title: "Random Day-Out at Burger King", location: "Burger King", caption: "Burgers, fries, and fun.", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=2672&auto=format&fit=crop" },
    { date: "2026-02-02", title: "Traditional Day", location: "College", caption: "Everyone looking their best in traditional attire.", image: "https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?q=80&w=2574&auto=format&fit=crop" },
    { date: "2026-02-03", title: "Turf with Boys (Turf 3)", location: "Turf Ground", caption: "The rivalry continues on the turf.", image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2667&auto=format&fit=crop" }
];

router.get('/', async (req, res) => {
    try {
        let log = [];

        // 1. Setup Admin
        const adminUser = 'admin';
        const exists = await User.findOne({ username: adminUser });
        if (!exists) {
            await User.create({ username: adminUser, password: 'admin123' });
            log.push("Admin user 'admin' created.");
        } else {
            log.push("Admin user already exists.");
        }

        // 2. Setup Memories
        const count = await Memory.countDocuments();
        if (count === 0) {
            await Memory.insertMany(memories);
            log.push(`Seeded ${memories.length} memories.`);
        } else {
            log.push(`Memories already exist (${count}). Skipping seed.`);
        }

        res.json({
            message: "Setup Complete",
            details: log
        });

    } catch (error) {
        console.error("Setup Error:", error);
        res.status(500).json({ message: "Setup Failed", error: error.message });
    }
});

module.exports = router;
