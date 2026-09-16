const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');

// @route   GET /api/recipes
// @desc    Get all recipes
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find({});
    res.json(recipes);
  } catch (err) {
    console.error('Fetch recipes error:', err);
    res.status(500).json({ message: 'Error loading recipes', error: err.message });
  }
});

// @route   POST /api/recipes
// @desc    Create a recipe
router.post('/', async (req, res) => {
  try {
    const recipe = await Recipe.create(req.body);
    res.status(201).json(recipe);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create recipe', error: err.message });
  }
});

module.exports = router;