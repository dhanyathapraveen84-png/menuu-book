import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Breakfast', 'Lunch & Dinners', 'Evening Meals', 'Desserts', 'Healthy & Light', 'Quick & Easy'],
    required: true 
  },
  coverImage: { type: String, required: true },
  prepTime: { type: String, default: '20 mins' },
  servings: { type: Number, default: 2 },
  ingredients: [{ type: String }],
  instructions: [{ step: Number, text: String }]
}, { timestamps: true });

export default mongoose.model('Recipe', recipeSchema);