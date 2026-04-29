const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkRoles = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        const adminCount = await User.countDocuments({ role: 'admin' });
        const librarianCount = await User.countDocuments({ role: 'librarian' });
        const adminUsers = await User.find({ role: 'admin' }, 'email name');
        const librarianUsers = await User.find({ role: 'librarian' }, 'email name');
        
        console.log(`Admins found: ${adminCount}`);
        adminUsers.forEach(u => console.log(` - ${u.name} (${u.email})`));
        
        console.log(`Librarians found: ${librarianCount}`);
        librarianUsers.forEach(u => console.log(` - ${u.name} (${u.email})`));
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

checkRoles();
