const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const User = require('./models/User');
require('dotenv').config();

const checkNotifications = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const latest = await Notification.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name role');
        console.log('Latest 5 Notifications:');
        latest.forEach(n => {
            console.log(`[${n.createdAt.toISOString()}] To: ${n.user?.name} (${n.user?.role})`);
            console.log(` Message: ${n.message}`);
            console.log(` Read: ${n.read}`);
            console.log('---');
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkNotifications();
