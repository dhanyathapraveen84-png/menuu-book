const mongoose = require('mongoose');

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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recipe', recipeSchema);