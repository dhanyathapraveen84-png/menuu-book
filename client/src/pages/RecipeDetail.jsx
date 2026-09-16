import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/recipes/${id}`);
        setRecipe(res.data);
      } catch (err) {
        console.error('Failed to load recipe details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading recipe...</div>;
  if (!recipe) return <div style={{ padding: '40px', textAlign: 'center' }}>Recipe not found.</div>;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: 'none',
          color: '#b3391b',
          fontSize: '15px',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        ← Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '36px', alignItems: 'start' }}>
        <div>
          <img
            src={recipe.image || 'https://via.placeholder.com/500x350'}
            alt={recipe.title}
            style={{ width: '100%', height: '340px', objectFit: 'cover', borderRadius: '16px' }}
          />
        </div>

        <div>
          <span style={{ fontSize: '13px', color: '#888', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {recipe.category}
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0 12px 0' }}>{recipe.title}</h1>
          <p style={{ color: '#555', fontSize: '15px', lineHeight: '1.6' }}>{recipe.description}</p>
          <div style={{ margin: '16px 0', fontSize: '14px', color: '#666' }}>
            <strong>Prep Time:</strong> {recipe.prepTime || '25 mins'}
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '36px 0' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Ingredients</h3>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#444' }}>
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              recipe.ingredients.map((item, index) => <li key={index}>{item}</li>)
            ) : (
              <li>No ingredients listed.</li>
            )}
          </ul>
        </div>

        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Procedure</h3>
          <div style={{ whiteSpace: 'pre-line', lineHeight: '1.8', color: '#444' }}>
            {recipe.instructions || 'No preparation instructions provided.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;