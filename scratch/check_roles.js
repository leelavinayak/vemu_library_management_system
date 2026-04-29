const mongoose = require('mongoose');
const User = require('./backend/models/User');
require('dotenv').config({ path: './backend/.env' });

const checkRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const adminCount = await User.countDocuments({ role: 'admin' });
        const librarianCount = await User.countDocuments({ role: 'librarian' });
        const adminUsers = await User.find({ role: 'admin' }, 'email');
        const librarianUsers = await User.find({ role: 'librarian' }, 'email');
        
        console.log(`Admins found: ${adminCount}`, adminUsers);
        console.log(`Librarians found: ${librarianCount}`, librarianUsers);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkRoles();
