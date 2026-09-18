const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/menubook';

async function seedUser() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'dhanyathapraveen84@gmail.com';
    const password = 'password123';

    // Delete any prior attempt completely
    await User.deleteMany({ email });

    // Create the fresh test user
    const newUser = await User.create({
      name: 'Dhanyatha',
      email,
      password,
    });

    console.log('User created successfully!');
    console.log('ID:', newUser._id);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding user:', err.message);
    process.exit(1);
  }
}

seedUser();