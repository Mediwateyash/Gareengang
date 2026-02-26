const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Memory = require('../models/Memory');
const Vlog = require('../models/Vlog');

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
    { date: "2025-02-07", title: "Ensemble Day 2026", location: "Watumull College", caption: "Traditional Day vibes with the gang.", image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2669&auto=format&fit=crop" },
    { date: "2023-12-25", title: "Christmas Party", location: "College Canteen", caption: "Secret Santa and snacks.", image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2669&auto=format&fit=crop" },
    { date: "2023-08-15", title: "Independence Day", location: "College Ground", caption: "Flag hoisting and celebrations.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2673&auto=format&fit=crop" }
];

const vlogs = [
    { title: "Ujjain Trip", videoUrl: "https://www.youtube.com/watch?v=VCitQgryySA&t=2443s", category: "Trip", youtubeId: "VCitQgryySA" },
    { title: "Sports Day", videoUrl: "https://www.youtube.com/watch?v=CjI3RdzGOqM&t=679s", category: "Event", youtubeId: "CjI3RdzGOqM" },
    { title: "Badlapur – Barvi Dam", videoUrl: "https://www.youtube.com/watch?v=RHrQGQHbdh0&t=316s", category: "Trip", youtubeId: "RHrQGQHbdh0" },
    { title: "Hall Ticket Drama", videoUrl: "https://www.youtube.com/watch?v=85mg4YePTqo&t=34s", category: "Fun", youtubeId: "85mg4YePTqo" },
    { title: "Peb Fort (Vikatgad)", videoUrl: "https://www.youtube.com/watch?v=fSbK8UZe8E0&t=95s", category: "Trip", youtubeId: "fSbK8UZe8E0" }
];

router.get('/', async (req, res) => {
    try {
        let log = [];

        // 1. Setup Admin
        const adminUser = 'admin';
        const exists = await User.findOne({ username: adminUser });
        if (!exists) {
            await User.create({ name: 'Super Admin', username: adminUser, password: 'password123', role: 'admin' });
            log.push("Admin user 'admin' created with password 'password123'.");
        } else {
            log.push("Admin user already exists.");
        }

        // 2. Setup Memories
        const memCount = await Memory.countDocuments();
        if (memCount === 0) {
            await Memory.insertMany(memories);
            log.push(`Seeded ${memories.length} memories.`);
        } else {
            log.push(`Memories already exist (${memCount}). Skipping seed.`);
        }

        // 3. Setup Vlogs
        const vlogCount = await Vlog.countDocuments();
        if (vlogCount === 0) {
            await Vlog.insertMany(vlogs);
            log.push(`Seeded ${vlogs.length} vlogs.`);
        } else {
            log.push(`Vlogs already exist (${vlogCount}). Skipping seed.`);
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
