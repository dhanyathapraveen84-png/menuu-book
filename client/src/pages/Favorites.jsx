import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Favorites = () => {
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE_URL = 'https://menuu-book.onrender.com/api';

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // 1. Fetch user's favorited IDs or objects from auth endpoint
      const favRes = await axios.get(`${API_BASE_URL}/auth/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 2. Fetch full recipe list to match against saved favorites
      const recipeRes = await axios.get(`${API_BASE_URL}/recipes`);
      const allRecipes = Array.isArray(recipeRes.data)
        ? recipeRes.data
        : recipeRes.data.recipes || [];

      // Normalize IDs
      const rawFavs = Array.isArray(favRes.data) ? favRes.data : [];
      const favIdSet = new Set(
        rawFavs.map(item => (typeof item === 'string' ? item : item._id))
      );

      // Filter recipes that exist in user's favorites
      const matched = allRecipes.filter(r => favIdSet.has(r._id) || r.isFavorite);
      setFavoriteRecipes(matched);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (e, recipeId) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');

    // Optimistic remove
    setFavoriteRecipes(prev => prev.filter(r => r._id !== recipeId));

    try {
      await axios.post(
        `${API_BASE_URL}/auth/favorites/${recipeId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Failed to remove favorite:', err);
      // Refetch if error occurs
      fetchFavorites();
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#1a1a1a' }}>
          Saved Favorites
        </h1>
        <p style={{ color: '#666', margin: 0 }}>All your bookmarked recipes in one convenient place</p>
      </header>

      {/* Grid Content */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#888', marginTop: '60px' }}>Loading saved recipes...</p>
      ) : favoriteRecipes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed #ddd', borderRadius: '16px' }}>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
            You haven't saved any recipes to your favorites yet.
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              backgroundColor: '#db3391',
              color: '#fff',
              textDecoration: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            Explore Recipes →
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '24px'
          }}
        >
          {favoriteRecipes.map(recipe => (
            <div
              key={recipe._id}
              onClick={() => navigate(`/recipe/${recipe._id}`)}
              style={{
                border: '1px solid #eee',
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
                backgroundColor: '#fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Unfavorite Heart Button */}
              <button
                type="button"
                onClick={e => handleRemoveFavorite(e, recipe._id)}
                title="Remove from favorites"
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
                  fontSize: '18px',
                  zIndex: 2
                }}
              >
                ❤️
              </button>

              {/* Image */}
              <img
                src={
                  recipe.imageUrl ||
                  recipe.img ||
                  recipe.image ||
                  'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500'
                }
                alt={recipe.title || recipe.name}
                onError={e => {
                  e.target.onerror = null;
                  e.target.src =
                    'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500';
                }}
                style={{
                  width: '100%',
                  height: '180px',
                  objectFit: 'cover'
                }}
              />

              {/* Details */}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span
                  style={{
                    fontSize: '11px',
                    color: '#db3391',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: 'bold',
                    marginBottom: '4px'
                  }}
                >
                  {recipe.category || 'General'}
                </span>
                <h3
                  style={{
                    margin: '4px 0 8px 0',
                    fontSize: '17px',
                    fontWeight: 'bold',
                    color: '#222'
                  }}
                >
                  {recipe.title || recipe.name}
                </h3>
                {recipe.description && (
                  <p
                    style={{
                      fontSize: '13px',
                      color: '#666',
                      lineHeight: '1.4',
                      marginBottom: '12px'
                    }}
                  >
                    {recipe.description.slice(0, 65)}...
                  </p>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 'auto',
                    fontSize: '12px',
                    color: '#888'
                  }}
                >
                  <span>⏱ {recipe.cookingTime || 30} mins</span>
                  <span>🍽 {recipe.servings || 2} servings</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;