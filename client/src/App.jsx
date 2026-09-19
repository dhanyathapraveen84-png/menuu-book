import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout & Pages
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Favorites from './pages/Favorites';
import AddRecipe from './pages/AddRecipe';
import MyRecipes from './pages/MyRecipes';
import RecipeDetail from './pages/RecipeDetail';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main Application with Persistent Sidebar Navigation */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="add-recipe" element={<AddRecipe />} />
          <Route path="my-recipes" element={<MyRecipes />} />
          <Route path="recipe/:id" element={<RecipeDetail />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;