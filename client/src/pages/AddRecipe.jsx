import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddRecipe = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: 'Lunch & Dinners',
    image: '',
    prepTime: '',
    description: '',
    ingredients: '',
    instructions: ''
  });
  const [loading, setLoading] = useState(false);

  const categories = ['Breakfast', 'Lunch & Dinners', 'Evening Meals', 'Desserts'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in first to create a recipe.');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        'http://localhost:5000/api/recipes',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert('Recipe published successfully!');
      navigate('/my-recipes');
    } catch (err) {
      console.error('Failed to create recipe:', err);
      alert(err.response?.data?.message || 'Error creating recipe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '40px auto', padding: '32px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
      <h2 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '8px' }}>Create New Recipe</h2>
      <p style={{ color: '#666', marginBottom: '28px' }}>Share your culinary ideas with the community</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>Recipe Title *</label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Pan-fried Garlic Butter Steak"
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px' }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>Prep Time</label>
            <input
              type="text"
              name="prepTime"
              value={formData.prepTime}
              onChange={handleChange}
              placeholder="e.g. 25 mins"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>Image URL</label>
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://images.unsplash.com/..."
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>Short Description</label>
          <textarea
            name="description"
            rows="2"
            value={formData.description}
            onChange={handleChange}
            placeholder="A quick summary of the dish..."
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>Ingredients (comma-separated)</label>
          <textarea
            name="ingredients"
            rows="3"
            value={formData.ingredients}
            onChange={handleChange}
            placeholder="6 oz Asparagus, 4 cloves garlic, 1 lb baby potatoes, 2 sprigs thyme"
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>Cooking Procedure</label>
          <textarea
            name="instructions"
            rows="4"
            value={formData.instructions}
            onChange={handleChange}
            placeholder="Step 1: Season the steak... Step 2: Heat skillet..."
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '12px',
            padding: '14px',
            backgroundColor: '#b3391b',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Submitting...' : 'Publish Recipe'}
        </button>
      </form>
    </div>
  );
};

export default AddRecipe;