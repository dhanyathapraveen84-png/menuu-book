import axios from 'axios';

const API = axios.create({
  baseURL: 'https://menuu-book.onrender.com/api',
});

// Automatically attach JWT token if it exists in localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export const toggleFavoriteRecipe = (recipeId) => API.put(`/recipes/${recipeId}/favorite`);
export const getFavoriteRecipes = () => API.get('/recipes/user/favorites');

export default API;