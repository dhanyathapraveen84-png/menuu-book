import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const MyRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    category: 'Lunch & Dinners',
    cookingTime: 30,
    servings: 2,
    imageUrl: '',
    description: ''
  });
  const navigate = useNavigate();

  const API_BASE_URL = 'https://menuu-book.onrender.com/api';

  useEffect(() => {
    fetchMyRecipes();
  }, []);

  const fetchMyRecipes = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/recipes/user/my-recipes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecipes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load user recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recipeId) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_BASE_URL}/recipes/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecipes(prev => prev.filter(r => r._id !== recipeId));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Could not delete recipe.');
    }
  };

  const startEdit = (recipe) => {
    setEditingRecipe(recipe._id);
    setEditFormData({
      title: recipe.title || '',
      category: recipe.category || 'Lunch & Dinners',
      cookingTime: recipe.cookingTime || 30,
      servings: recipe.servings || 2,
      imageUrl: recipe.imageUrl || '',
      description: recipe.description || ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const res = await axios.put(
        `${API_BASE_URL}/recipes/${editingRecipe}`,
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecipes(prev => prev.map(r => (r._id === editingRecipe ? res.data : r)));
      setEditingRecipe(null);
    } catch (err) {
      console.error('Update error:', err);
      alert('Could not save recipe changes.');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#222', margin: 0 }}>
            Manage Recipes
          </h1>
          <p style={{ color: '#777', margin: '4px 0 0 0', fontSize: '14px' }}>
            Recipes created under your account
          </p>
        </div>
        <Link
          to="/add-recipe"
          style={{
            backgroundColor: '#db3391',
            color: '#fff',
            textDecoration: 'none',
            padding: '10px 18px',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '14px',
            boxShadow: '0 2px 8px rgba(219, 51, 145, 0.25)'
          }}
        >
          + Add Recipe
        </Link>
      </div>

      {/* Content Area */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>Loading recipes...</p>
      ) : recipes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed #ddd', borderRadius: '16px' }}>
          <p style={{ color: '#666', marginBottom: '16px' }}>You haven't created any recipes yet.</p>
          <Link
            to="/add-recipe"
            style={{
              color: '#db3391',
              fontWeight: '600',
              textDecoration: 'none'
            }}
          >
            Create your first recipe →
          </Link>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #eee', color: '#777' }}>
                <th style={{ padding: '16px 20px' }}>Recipe</th>
                <th style={{ padding: '16px 20px' }}>Category</th>
                <th style={{ padding: '16px 20px' }}>Cooking Time</th>
                <th style={{ padding: '16px 20px' }}>Servings</th>
                <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map(recipe => (
                <tr key={recipe._id} style={{ borderBottom: '1px solid #f6f6f6' }}>
                  <td style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <img
                      src={recipe.imageUrl || 'https://via.placeholder.com/60'}
                      alt={recipe.title}
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <span style={{ fontWeight: '600', color: '#333' }}>{recipe.title}</span>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#666' }}>
                    <span style={{ backgroundColor: '#fce4ec', color: '#db3391', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>
                      {recipe.category || 'General'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#666' }}>{recipe.cookingTime || 30} mins</td>
                  <td style={{ padding: '14px 20px', color: '#666' }}>{recipe.servings || 2} pers.</td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <button
                      onClick={() => startEdit(recipe)}
                      style={{
                        marginRight: '8px',
                        background: 'none',
                        border: '1px solid #ddd',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: '#444'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(recipe._id)}
                      style={{
                        background: '#fff0f0',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: '#d32f2f',
                        fontWeight: '500'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingRecipe && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              padding: '24px',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '480px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
            }}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Edit Recipe</h2>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Recipe Title</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Category</label>
                  <select
                    value={editFormData.category}
                    onChange={e => setEditFormData({ ...editFormData, category: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '8px' }}
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch & Dinners">Lunch & Dinners</option>
                    <option value="Evening Meals">Evening Meals</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Cook Time (mins)</label>
                  <input
                    type="number"
                    value={editFormData.cookingTime}
                    onChange={e => setEditFormData({ ...editFormData, cookingTime: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Image URL</label>
                <input
                  type="text"
                  value={editFormData.imageUrl}
                  onChange={e => setEditFormData({ ...editFormData, imageUrl: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setEditingRecipe(null)}
                  style={{ padding: '8px 16px', background: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', background: '#db3391', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRecipes;