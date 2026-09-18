import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddRecipe = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Lunch & Dinners',
    cookingTime: 30,
    servings: 2,
    description: '',
    ingredients: '',
    instructions: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:5000/api';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cookingTime' || name === 'servings' ? Number(value) : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to add a recipe.');
      navigate('/login');
      return;
    }

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('cookingTime', formData.cookingTime);
      data.append('servings', formData.servings);
      data.append('description', formData.description);
      data.append('instructions', formData.instructions);

      // Split ingredients by newline into JSON string
      const ingredientsArray = formData.ingredients
        .split('\n')
        .map(i => i.trim())
        .filter(Boolean);
      data.append('ingredients', JSON.stringify(ingredientsArray));

      if (selectedFile) {
        data.append('image', selectedFile);
      }

      await axios.post(`${API_BASE_URL}/recipes`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/my-recipes');
    } catch (err) {
      console.error('Failed to add recipe:', err);
      setError(err.response?.data?.message || 'Failed to create recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '8px', color: '#1a1a1a' }}>
        Add New Recipe
      </h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>Share your culinary creation with the world</p>

      {error && (
        <div style={{ padding: '12px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Recipe Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Creamy Tuscan Garlic Chicken"
            required
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px' }}
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch & Dinners">Lunch & Dinners</option>
              <option value="Evening Meals">Evening Meals</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Cook Time (minutes)</label>
            <input
              type="number"
              name="cookingTime"
              value={formData.cookingTime}
              onChange={handleChange}
              min="1"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Servings</label>
            <input
              type="number"
              name="servings"
              value={formData.servings}
              onChange={handleChange}
              min="1"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Image File Picker & Preview */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Recipe Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' }}
          />
          {previewUrl && (
            <div style={{ marginTop: '12px' }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #eee' }}
              />
            </div>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Short Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="2"
            placeholder="A short appetizing overview..."
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Ingredients (one per line)</label>
          <textarea
            name="ingredients"
            value={formData.ingredients}
            onChange={handleChange}
            rows="4"
            placeholder="2 chicken breasts&#10;1 cup heavy cream&#10;3 cloves garlic, minced"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Instructions (one step per line)</label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            rows="5"
            placeholder="Season chicken breasts with salt and pepper.&#10;Heat olive oil in skillet.&#10;Cook until golden brown."
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{ padding: '12px 20px', border: '1px solid #ddd', background: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#db3391',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              flex: 1
            }}
          >
            {loading ? 'Uploading & Publishing...' : 'Publish Recipe'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRecipe;