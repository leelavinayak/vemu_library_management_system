const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/library')
  .then(async () => {
  console.log('MongoDB Connected');
  
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('password123', salt);

  const admin = await User.findOne({ email: 'admin@library.com' });
  if (!admin) {
    await User.create({
      name: 'Super Admin',
      email: 'admin@library.com',
      password,
      role: 'admin'
    });
    console.log('Admin user created (admin@library.com / password123)');
  }

  const librarian = await User.findOne({ email: 'librarian@library.com' });
  if (!librarian) {
    await User.create({
      name: 'Main Librarian',
      email: 'librarian@library.com',
      password,
      role: 'librarian'
    });
    console.log('Librarian user created (librarian@library.com / password123)');
  }

  mongoose.disconnect();
}).catch(err => console.log(err));
