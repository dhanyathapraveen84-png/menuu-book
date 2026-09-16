import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:5000/api';

  // Fetch all recipes and current user's favorites on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      // 1. Fetch all public recipes
      const recipeRes = await axios.get(`${API_BASE_URL}/recipes`);
      setRecipes(Array.isArray(recipeRes.data) ? recipeRes.data : recipeRes.data.recipes || []);

      // 2. Fetch current user favorites if logged in
      if (token) {
        try {
          const favRes = await axios.get(`${API_BASE_URL}/auth/favorites`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          // favRes.data may be an array of objects or strings
          const favIds = Array.isArray(favRes.data)
            ? favRes.data.map(item => (typeof item === 'string' ? item : item._id))
            : [];
          setFavorites(favIds);
        } catch (favErr) {
          console.error("Could not fetch user favorites:", favErr);
        }
      }
    } catch (err) {
      console.error("Error loading recipes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorite function
  const handleToggleFavorite = async (recipeId) => {
    if (!recipeId) {
      alert("Invalid recipe ID");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in first to save favorites!");
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/favorites/${recipeId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update local state so the heart icon immediately changes
      if (favorites.includes(recipeId)) {
        setFavorites(favorites.filter(id => id !== recipeId));
      } else {
        setFavorites([...favorites, recipeId]);
      }

      console.log("Favorite updated successfully:", response.data);
    } catch (err) {
      console.error("Favorite toggle error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update favorite. Please check server connection.";
      alert(errorMessage);
    }
  };

  const categories = ['All', 'Breakfast', 'Lunch & Dinners', 'Evening Meals'];

  const filteredRecipes = activeCategory === 'All'
    ? recipes
    : recipes.filter(r => r.category?.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Browse Recipes</h1>
        <p style={{ color: '#666' }}>Discover and save your favorite dishes</p>
      </header>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeCategory === cat ? '#b3391b' : '#f0f0f0',
              color: activeCategory === cat ? '#fff' : '#333',
              fontWeight: '500'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recipe Grid */}
      {loading ? (
        <p>Loading delicious recipes...</p>
      ) : filteredRecipes.length === 0 ? (
        <p>No recipes found in this category.</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '24px'
        }}>
          {filteredRecipes.map((recipe) => {
            const isFav = favorites.includes(recipe._id);

            return (
              <div
                key={recipe._id}
                style={{
                  border: '1px solid #eee',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundColor: '#fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
              >
                {/* Favorite Heart Button */}
                <button
                  type="button"
                  onClick={() => handleToggleFavorite(recipe._id)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    fontSize: '18px'
                  }}
                  title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                >
                  {isFav ? '❤️' : '🤍'}
                </button>

                {/* Recipe Image */}
                <img
                  src={recipe.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={recipe.title || recipe.name}
                  style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                />

                {/* Card Details */}
                <div style={{ padding: '16px' }}>
                  <span style={{
                    fontSize: '12px',
                    color: '#888',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: 'bold'
                  }}>
                    {recipe.category || 'Lunch & Dinners'}
                  </span>
                  <h3 style={{ margin: '8px 0', fontSize: '18px' }}>
                    {recipe.title || recipe.name}
                  </h3>
                  {recipe.description && (
                    <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.4' }}>
                      {recipe.description.slice(0, 70)}...
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;