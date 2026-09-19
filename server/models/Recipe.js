const mongoose = require('mongoose');

// Sub-document schema for individual reviews
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
      default: 'Anonymous',
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'Lunch & Dinners',
      trim: true,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    instructions: {
      type: String,
      default: '',
    },
    cookingTime: {
      type: Number,
      default: 30,
    },
    servings: {
      type: Number,
      default: 2,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Ratings and Reviews
    reviews: [reviewSchema],
    averageRating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recipe', recipeSchema);