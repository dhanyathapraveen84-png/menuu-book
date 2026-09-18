const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Recipe = require('../models/Recipe');
const authMiddleware = require('../middleware/authMiddleware');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|webp/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Images only (jpg, jpeg, png, webp)!'));
  }
});

// 1. GET all recipes
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find({});
    res.json(recipes);
  } catch (err) {
    console.error('Fetch recipes error:', err.message);
    res.status(500).json({ message: 'Error loading recipes' });
  }
});

// 2. GET all favorited recipes
router.get('/favorites', async (req, res) => {
  try {
    const favorites = await Recipe.find({ isFavorite: true });
    res.json(favorites);
  } catch (err) {
    console.error('Fetch favorites error:', err.message);
    res.status(500).json({ message: 'Error fetching favorite recipes' });
  }
});

// 3. GET user's own recipes
router.get('/user/my-recipes', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const userRecipes = await Recipe.find({ user: userId }).sort({ createdAt: -1 });
    res.json(userRecipes);
  } catch (err) {
    console.error('Fetch my recipes error:', err.message);
    res.status(500).json({ message: 'Error loading user recipes' });
  }
});

// 4. Toggle favorite status
const toggleFavorite = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    recipe.isFavorite = !recipe.isFavorite;
    await recipe.save();

    res.json(recipe);
  } catch (err) {
    console.error('Favorite error:', err.message);
    res.status(500).json({ message: 'Error toggling favorite' });
  }
};

router.post('/:id/favorite', toggleFavorite);
router.put('/:id/favorite', toggleFavorite);
router.patch('/:id/favorite', toggleFavorite);
router.post('/favorite/:id', toggleFavorite);
router.put('/favorite/:id', toggleFavorite);
router.patch('/favorite/:id', toggleFavorite);

// 5. POST create recipe with Multer file upload
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, category, cookingTime, servings, description, ingredients, instructions, imageUrl } = req.body;

    // Use uploaded file path if present, otherwise fallback to URL or default
    let finalImageUrl = imageUrl || '';
    if (req.file) {
      finalImageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    // Parse ingredients if sent as a JSON string
    let parsedIngredients = [];
    if (typeof ingredients === 'string') {
      try {
        parsedIngredients = JSON.parse(ingredients);
      } catch {
        parsedIngredients = ingredients.split('\n').map(i => i.trim()).filter(Boolean);
      }
    } else if (Array.isArray(ingredients)) {
      parsedIngredients = ingredients;
    }

    const recipe = await Recipe.create({
      title,
      category: category || 'Lunch & Dinners',
      cookingTime: Number(cookingTime) || 30,
      servings: Number(servings) || 2,
      imageUrl: finalImageUrl,
      description,
      ingredients: parsedIngredients,
      instructions,
      user: req.user._id || req.user.id
    });

    res.status(201).json(recipe);
  } catch (err) {
    console.error('Create recipe error:', err.message);
    res.status(400).json({ message: 'Failed to create recipe', error: err.message });
  }
});

// 6. GET single recipe by ID
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('user', 'name email');
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (err) {
    console.error('Get recipe error:', err.message);
    res.status(500).json({ message: 'Error fetching recipe' });
  }
});

// 7. PUT update recipe
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const currentUserId = (req.user._id || req.user.id).toString();
    if (recipe.user && recipe.user.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Not authorized to edit this recipe' });
    }

    const updated = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.json(updated);
  } catch (err) {
    console.error('Update recipe error:', err.message);
    res.status(500).json({ message: 'Error updating recipe' });
  }
});

// 8. DELETE recipe
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const currentUserId = (req.user._id || req.user.id).toString();
    if (recipe.user && recipe.user.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Not authorized to delete this recipe' });
    }

    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    console.error('Delete recipe error:', err.message);
    res.status(500).json({ message: 'Error deleting recipe' });
  }
});

module.exports = router;