const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmins = async () => {
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
            // Optional: Update password if needed, but skipping to avoid overwrite if changed
            console.log(`Admin already exists: ${admin.username}`);
        }
    }
};

module.exports = seedAdmins;
