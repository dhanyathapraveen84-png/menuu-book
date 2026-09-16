import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Favorites = () => {
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    const token = localStorage.getItem('token');
    console.log('[Favorites] Current Token:', token);

    if (!token) {
      alert('Please log in to view your favorites.');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/auth/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('[Favorites] Data received from backend:', res.data);

      const items = Array.isArray(res.data) ? res.data : [];
      setFavoriteRecipes(items.filter(item => item !== null));
    } catch (err) {
      console.error('[Favorites] Error fetching favorites:', err);
      alert(err.response?.data?.message || 'Failed to load favorites.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (recipeId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `${API_BASE_URL}/auth/favorites/${recipeId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setFavoriteRecipes(prev => prev.filter(recipe => recipe._id !== recipeId));
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>My Favorites</h1>
        <p style={{ color: '#666' }}>All your saved dishes in one place</p>
      </header>

      {loading ? (
        <p>Loading your favorite recipes...</p>
      ) : favoriteRecipes.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p style={{ fontSize: '18px', color: '#777' }}>You haven't added any favorite recipes yet.</p>
          <button
            onClick={() => navigate('/')}
            style={{
              marginTop: '16px',
              padding: '10px 20px',
              backgroundColor: '#b3391b',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Browse Recipes
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '24px'
        }}>
          {favoriteRecipes.map((recipe) => (
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
              <button
                type="button"
                onClick={() => handleRemoveFavorite(recipe._id)}
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
                title="Remove from favorites"
              >
                ❤️
              </button>

              <img
                src={recipe.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={recipe.title || recipe.name || 'Recipe'}
                style={{ width: '100%', height: '180px', objectFit: 'cover' }}
              />

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
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;