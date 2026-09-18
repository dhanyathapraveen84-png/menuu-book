import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:5000/api';

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

      // 2. Fetch user favorites if logged in
      if (token) {
        try {
          const favRes = await axios.get(`${API_BASE_URL}/auth/favorites`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const favIds = Array.isArray(favRes.data)
            ? favRes.data.map(item => (typeof item === 'string' ? item : item._id))
            : [];
          setFavorites(favIds);
        } catch (favErr) {
          console.error('Could not fetch user favorites:', favErr);
        }
      }
    } catch (err) {
      console.error('Error loading recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (e, recipeId) => {
    e.stopPropagation();

    if (!recipeId) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in first to save favorites!');
      navigate('/login');
      return;
    }

    const isCurrentlyFav = favorites.includes(recipeId);
    setFavorites(prev =>
      isCurrentlyFav ? prev.filter(id => id !== recipeId) : [...prev, recipeId]
    );

    try {
      await axios.post(
        `${API_BASE_URL}/auth/favorites/${recipeId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Favorite toggle error:', err);
      setFavorites(prev =>
        isCurrentlyFav ? [...prev, recipeId] : prev.filter(id => id !== recipeId)
      );
      alert('Failed to update favorite.');
    }
  };

  const categories = ['All', 'Breakfast', 'Lunch & Dinners', 'Evening Meals'];

  // Dynamic Category Counts
  const categoryCounts = useMemo(() => {
    const counts = { All: recipes.length };
    categories.forEach(cat => {
      if (cat !== 'All') {
        counts[cat] = recipes.filter(
          r => r.category?.toLowerCase() === cat.toLowerCase()
        ).length;
      }
    });
    return counts;
  }, [recipes]);

  // Combined Search & Category Filtering
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesCategory =
        activeCategory === 'All' ||
        recipe.category?.toLowerCase() === activeCategory.toLowerCase();

      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCategory;

      const titleMatch = (recipe.title || recipe.name || '').toLowerCase().includes(query);
      const descMatch = (recipe.description || '').toLowerCase().includes(query);
      const ingredientMatch = Array.isArray(recipe.ingredients)
        ? recipe.ingredients.some(ing => ing.toLowerCase().includes(query))
        : false;

      return matchesCategory && (titleMatch || descMatch || ingredientMatch);
    });
  }, [recipes, activeCategory, searchQuery]);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header & Live Search Bar */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#1a1a1a' }}>
            Browse Recipes
          </h1>
          <p style={{ color: '#666', margin: 0 }}>Discover and save your favorite dishes</p>
        </div>

        {/* Live Search Input */}
        <div style={{ position: 'relative', minWidth: '280px', maxWidth: '400px', width: '100%' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search recipes, ingredients..."
            style={{
              width: '100%',
              padding: '10px 38px 10px 16px',
              borderRadius: '24px',
              border: '1px solid #e0e0e0',
              outline: 'none',
              fontSize: '14px',
              boxSizing: 'border-box',
              backgroundColor: '#fafafa',
              transition: 'all 0.2s'
            }}
            onFocus={e => (e.target.style.backgroundColor = '#fff')}
            onBlur={e => (e.target.style.backgroundColor = '#fafafa')}
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#999',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ✕
            </button>
          ) : (
            <span
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#aaa',
                pointerEvents: 'none'
              }}
            >
              🔍
            </span>
          )}
        </div>
      </header>

      {/* Category Pills with Counters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {categories.map(cat => {
          const isActive = activeCategory === cat;
          const count = categoryCounts[cat] || 0;

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: '24px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isActive ? '#db3391' : '#f4f4f4',
                color: isActive ? '#fff' : '#444',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                fontSize: '13px'
              }}
            >
              <span>{cat}</span>
              <span
                style={{
                  fontSize: '11px',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : '#e0e0e0',
                  color: isActive ? '#fff' : '#666',
                  padding: '2px 7px',
                  borderRadius: '12px',
                  fontWeight: '600'
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Recipe Grid Area */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#888', marginTop: '60px' }}>Loading delicious recipes...</p>
      ) : filteredRecipes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '12px' }}>
            No recipes matched "{searchQuery || activeCategory}".
          </p>
          {(searchQuery || activeCategory !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
              style={{
                backgroundColor: '#db3391',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '24px'
          }}
        >
          {filteredRecipes.map(recipe => {
            const isFav = favorites.includes(recipe._id);
            return (
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
                  flexDirection: 'column',
                  transition: 'transform 0.15s ease'
                }}
              >
                {/* Favorite Heart Button */}
                <button
                  type="button"
                  onClick={e => handleToggleFavorite(e, recipe._id)}
                  title={isFav ? 'Remove from Favorites' : 'Add to Favorites'}
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
                  {isFav ? '❤️' : '🤍'}
                </button>

                {/* Recipe Image */}
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

                {/* Card Details */}
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
                    {recipe.category || 'Lunch & Dinners'}
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;