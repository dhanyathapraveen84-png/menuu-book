const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const authMiddleware = require('../middleware/authMiddleware');
const { upload, cloudinary } = require('../middleware/cloudinary');

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

// 5. POST create recipe with Cloudinary file upload
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, category, cookingTime, servings, description, ingredients, instructions, imageUrl } = req.body;

    // Cloudinary automatically returns the permanent secure image URL in req.file.path
    let finalImageUrl = imageUrl || '';
    if (req.file && req.file.path) {
      finalImageUrl = req.file.path;
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
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const currentUserId = (req.user._id || req.user.id).toString();
    if (recipe.user && recipe.user.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Not authorized to edit this recipe' });
    }

    const updateData = { ...req.body };

    // If a new image was uploaded to Cloudinary, update imageUrl
    if (req.file && req.file.path) {
      updateData.imageUrl = req.file.path;
    }

    // Handle ingredients parsing if passed as string
    if (typeof updateData.ingredients === 'string') {
      try {
        updateData.ingredients = JSON.parse(updateData.ingredients);
      } catch {
        updateData.ingredients = updateData.ingredients.split('\n').map(i => i.trim()).filter(Boolean);
      }
    }

    const updated = await Recipe.findByIdAndUpdate(req.params.id, updateData, {
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

    // If the recipe has a Cloudinary image, remove it from Cloudinary
    if (recipe.imageUrl && recipe.imageUrl.includes('cloudinary.com')) {
      try {
        const parts = recipe.imageUrl.split('/');
        const fileName = parts.pop().split('.')[0];
        const folder = parts.pop();
        const publicId = `${folder}/${fileName}`;

        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.error('Failed to delete image from Cloudinary:', cloudErr.message);
      }
    }

    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    console.error('Delete recipe error:', err.message);
    res.status(500).json({ message: 'Error deleting recipe' });
  }
});

// 9. POST add rating and review
router.post('/:id/reviews', async (req, res) => {
  try {
    const { rating, comment, user } = req.body;
    const numericRating = Number(rating);

    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'Review comment cannot be empty' });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const newReview = {
      user: user || 'Anonymous',
      rating: numericRating,
      comment: comment.trim()
    };

    recipe.reviews.push(newReview);
    recipe.numReviews = recipe.reviews.length;

    // Calculate updated average rating
    const totalScore = recipe.reviews.reduce((acc, item) => acc + item.rating, 0);
    recipe.averageRating = Number((totalScore / recipe.reviews.length).toFixed(1));

    const updatedRecipe = await recipe.save();

    res.status(201).json({
      message: 'Review added successfully',
      recipe: updatedRecipe
    });
  } catch (err) {
    console.error('Add review error:', err.message);
    res.status(500).json({ message: 'Server error while submitting review' });
  }
});

module.exports = router;