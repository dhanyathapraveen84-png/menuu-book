const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function runSeed() {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/menu-book';
    await mongoose.connect(uri);
    console.log('Connected to DB');

    // Remove old user document to avoid conflicts
    await User.deleteOne({ email: 'dhanyathapraveen84@gmail.com' });

    // Pass the plain text password here — User.js will hash it ONCE
    await User.create({
      name: 'Dhanyatha',
      email: 'dhanyathapraveen84@gmail.com',
      password: 'password123',
      role: 'user',
    });

    console.log('SEEDING SUCCESSFUL: dhanyathapraveen84@gmail.com /password123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

runSeed();