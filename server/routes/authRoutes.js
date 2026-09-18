const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_12345';

// 1. Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        favorites: newUser.favorites,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// 2. Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        favorites: user.favorites,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// 3. GET /api/auth/favorites - Returns populated array of favorite recipes
router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId).populate({
      path: 'favorites',
      model: 'Recipe',
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out nulls in case any referenced recipe was removed
    const validFavorites = (user.favorites || []).filter((item) => item !== null);

    res.json(validFavorites);
  } catch (err) {
    console.error('Fetch favorites error:', err);
    res.status(500).json({ message: 'Error fetching favorites' });
  }
});

// 4. Toggle Favorite Status
const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const targetRecipeId = req.params.recipeId || req.params.id || req.body.recipeId;

    if (!targetRecipeId) {
      return res.status(400).json({ message: 'Recipe ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.favorites) {
      user.favorites = [];
    }

    const index = user.favorites.findIndex(
      (id) => id && id.toString() === targetRecipeId.toString()
    );

    let isFavorited = false;
    if (index > -1) {
      user.favorites.splice(index, 1);
      isFavorited = false;
    } else {
      user.favorites.push(targetRecipeId);
      isFavorited = true;
    }

    await user.save();

    // Populate updated favorites before returning response
    await user.populate({
      path: 'favorites',
      model: 'Recipe',
    });

    const validFavorites = (user.favorites || []).filter((item) => item !== null);

    res.json({
      message: isFavorited ? 'Added to favorites' : 'Removed from favorites',
      isFavorite: isFavorited,
      favorites: validFavorites,
    });
  } catch (err) {
    console.error('Toggle favorite error:', err);
    res.status(500).json({ message: 'Error updating favorites' });
  }
};

// Handlers for every frontend route pattern
router.post('/favorites/:recipeId', authMiddleware, toggleFavorite);
router.put('/favorites/:recipeId', authMiddleware, toggleFavorite);
router.post('/favorite/:recipeId', authMiddleware, toggleFavorite);
router.put('/favorite/:recipeId', authMiddleware, toggleFavorite);
router.post('/favorites', authMiddleware, toggleFavorite);

module.exports = router;