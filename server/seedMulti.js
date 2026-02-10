const mongoose = require('mongoose');
const Memory = require('./models/Memory');
const connectDB = require('./config/db');
require('dotenv').config();

const sampleStories = [
    "The day started with a chaotic plan that somehow worked out perfectly. We packed into the car, music blasting, and headed out with zero expectations but high hopes. The funniest moment was definitely when we got lost and ended up finding that hidden view point. It wasn't about the destination, but the crazy journey with this squad.",
    "This was one for the books! I remember the laughter echoing through the air. The food was amazing, the vibe was immaculate, and the company was even better. looking back at these photos makes me want to relive this day all over again.",
    "A spontaneous trip that turned into a core memory. We drove for hours, sang our hearts out, and forgot about all our stress. The sunset view was the cherry on top. Grateful for these moments and these people.",
    "Official squad outing! We planned this for weeks and it finally happened. From the morning meetup to the late-night snacks, everything was perfect. Can't wait for the next one!",
    "Just a random day that turned into an adventure. Sometimes the unplanned moments are the best ones. We laughed until our stomachs hurt and made memories that will last a lifetime."
];

const samplePeople = [
    ["Yash", "Manjush", "Aditya", "Rahul"],
    ["The Whole Gang", "Sarah", "Mike"],
    ["Just the Boys", "Amit", "Sanket"],
    ["Family & Friends", "Rohan", "Priya"],
    ["College Squad", "Neha", "Varun"]
];

const sampleGalleries = [
    [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
        "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80",
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80"
    ],
    [
        "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80",
        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80",
        "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?w=800&q=80"
    ],
    [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80"
    ]
];

const sampleVlogs = [
    "https://www.youtube.com/watch?v=VCitQgryySA", // existing mock
    "https://www.youtube.com/watch?v=CjI3RdzGOqM",
    ""
];

const seedMemories = async () => {
    try {
        await connectDB();
        console.log('Database Connected.');

        const memories = await Memory.find();
        console.log(`Found ${memories.length} memories to update...`);

        for (let i = 0; i < memories.length; i++) {
            const mem = memories[i];

            // Pick random samples
            const randomStory = sampleStories[i % sampleStories.length];
            const randomPeople = samplePeople[i % samplePeople.length];
            const randomGallery = sampleGalleries[i % sampleGalleries.length];
            const randomVlog = sampleVlogs[i % sampleVlogs.length];

            // Only update if missing (or force update for this task)
            mem.story = mem.story || randomStory;
            mem.people = (mem.people && mem.people.length > 0) ? mem.people : randomPeople;
            mem.gallery = (mem.gallery && mem.gallery.length > 0) ? mem.gallery : randomGallery;
            mem.relatedVlogUrl = mem.relatedVlogUrl || randomVlog;

            await mem.save();
            console.log(`Updated: ${mem.title}`);
        }

        console.log('All memories enriched with dummy data!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedMemories();
