import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchMyRecipes();
  }, []);

  const fetchMyRecipes = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to view your created recipes.');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      // Fetches all recipes, then filters by the logged-in user's created list
      const res = await axios.get(`${API_BASE_URL}/recipes`);
      const userRes = await axios.get(`${API_BASE_URL}/auth/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const currentUserId = userRes.data._id || userRes.data.id;
      const userCreatedRecipes = (res.data || []).filter(
        (recipe) => recipe.createdBy === currentUserId || recipe.createdBy?._id === currentUserId
      );

      setRecipes(userCreatedRecipes);
    } catch (err) {
      console.error('Error fetching your recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 6px 0' }}>My Recipes</h1>
          <p style={{ color: '#666', margin: 0 }}>Recipes you have authored and published</p>
        </div>
        <button
          onClick={() => navigate('/add-recipe')}
          style={{
            padding: '10px 18px',
            backgroundColor: '#b3391b',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          + Add New Recipe
        </button>
      </div>

      {loading ? (
        <p>Loading your authored recipes...</p>
      ) : recipes.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '48px', color: '#777' }}>
          <p style={{ fontSize: '18px' }}>You haven't posted any recipes yet.</p>
          <button
            onClick={() => navigate('/add-recipe')}
            style={{
              marginTop: '12px',
              padding: '10px 20px',
              backgroundColor: '#b3391b',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Create your first recipe
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
          {recipes.map((recipe) => (
            <div
              key={recipe._id}
              onClick={() => navigate(`/recipe/${recipe._id}`)}
              style={{
                border: '1px solid #eee',
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: '#fff',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                transition: 'transform 0.15s ease-in-out'
              }}
            >
              <img
                src={recipe.image || 'https://via.placeholder.com/300x200?text=Recipe'}
                alt={recipe.title}
                style={{ width: '100%', height: '170px', objectFit: 'cover' }}
              />
              <div style={{ padding: '16px' }}>
                <span style={{ fontSize: '11px', color: '#888', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {recipe.category}
                </span>
                <h3 style={{ margin: '6px 0 10px 0', fontSize: '17px' }}>{recipe.title}</h3>
                <span style={{ fontSize: '13px', color: '#999' }}>⏱ {recipe.prepTime || '20 mins'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRecipes;