import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentServings, setCurrentServings] = useState(2);
  const [checkedIngredients, setCheckedIngredients] = useState({});

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await axios.get(`https://menuu-book.onrender.com/api/recipes/${id}`);
        setRecipe(res.data);
        if (res.data.servings) {
          setCurrentServings(Number(res.data.servings));
        }
      } catch (err) {
        console.error('Error fetching recipe detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  const toggleIngredient = (idx) => {
    setCheckedIngredients(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleServingChange = (delta) => {
    setCurrentServings(prev => Math.max(1, prev + delta));
  };

  // Helper to dynamically scale numbers in ingredient strings
  const scaleIngredient = (itemStr, baseServings, activeServings) => {
    if (!baseServings || baseServings <= 0 || !activeServings) return itemStr;
    const factor = activeServings / baseServings;

    // Matches whole numbers, decimals, or common fractions (1/2, 3/4)
    return itemStr.replace(/(\d+\/\d+|\d+(\.\d+)?)/g, (match) => {
      let val = 0;
      if (match.includes('/')) {
        const [num, den] = match.split('/').map(Number);
        val = num / den;
      } else {
        val = parseFloat(match);
      }

      const scaled = val * factor;
      // Round nicely: whole numbers as integers, decimals to max 2 decimals
      return Number.isInteger(scaled) ? scaled.toString() : scaled.toFixed(2).replace(/\.?0+$/, '');
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', color: '#666' }}>
        Loading recipe details...
      </div>
    );
  }

  if (!recipe) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center' }}>
        <h2 style={{ color: '#d32f2f', marginBottom: '16px' }}>Recipe not found</h2>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '8px 18px',
            backgroundColor: '#db3391',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const rawSteps = Array.isArray(recipe.instructions)
    ? recipe.instructions
    : recipe.instructions
    ? recipe.instructions.split('\n').filter(step => step.trim().length > 0)
    : [];

  const originalServings = Number(recipe.servings) || 2;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: 'none',
          color: '#666',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          marginBottom: '20px',
          padding: 0
        }}
      >
        ← Back
      </button>

      {/* Top Banner / Hero */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '36px',
          marginBottom: '40px',
          alignItems: 'center'
        }}
      >
        <img
          src={
            recipe.imageUrl ||
            recipe.img ||
            recipe.image ||
            'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800'
          }
          alt={recipe.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800';
          }}
          style={{
            width: '100%',
            height: '320px',
            objectFit: 'cover',
            borderRadius: '20px',
            boxShadow: '0 6px 18px rgba(0,0,0,0.08)'
          }}
        />

        <div>
          <span
            style={{
              display: 'inline-block',
              padding: '6px 14px',
              backgroundColor: '#fce4ec',
              color: '#db3391',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              marginBottom: '14px'
            }}
          >
            {recipe.category || 'General'}
          </span>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              marginBottom: '12px'
            }}
          >
            {recipe.title || recipe.name}
          </h1>
          {recipe.description && (
            <p
              style={{
                fontSize: '15px',
                color: '#555',
                lineHeight: '1.6',
                marginBottom: '24px'
              }}
            >
              {recipe.description}
            </p>
          )}

          {/* Quick Metrics & Servings Adjuster */}
          <div
            style={{
              display: 'flex',
              gap: '32px',
              borderTop: '1px solid #eee',
              borderBottom: '1px solid #eee',
              padding: '16px 0',
              alignItems: 'center'
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '11px',
                  color: '#999',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '2px'
                }}
              >
                Cooking Time
              </span>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                ⏱ {recipe.cookingTime || 30} mins
              </span>
            </div>

            <div>
              <span
                style={{
                  fontSize: '11px',
                  color: '#999',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '4px'
                }}
              >
                Servings (Adjust)
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleServingChange(-1)}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    border: '1px solid #ddd',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  −
                </button>
                <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#db3391', minWidth: '70px', textAlign: 'center' }}>
                  🍽 {currentServings} pers.
                </span>
                <button
                  type="button"
                  onClick={() => handleServingChange(1)}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    border: '1px solid #ddd',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Section: Ingredients & Steps */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '36px'
        }}
      >
        {/* Ingredients Checklist */}
        <div
          style={{
            backgroundColor: '#fafafa',
            border: '1px solid #eee',
            borderRadius: '16px',
            padding: '24px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#222' }}>
              Ingredients
            </h2>
            {currentServings !== originalServings && (
              <span style={{ fontSize: '11px', color: '#db3391', fontWeight: '600' }}>
                (Scaled {currentServings}/{originalServings})
              </span>
            )}
          </div>

          {recipe.ingredients && recipe.ingredients.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {recipe.ingredients.map((item, idx) => {
                const displayItem = scaleIngredient(item, originalServings, currentServings);

                return (
                  <li
                    key={idx}
                    onClick={() => toggleIngredient(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 0',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedIngredients[idx]}
                      onChange={() => toggleIngredient(idx)}
                      style={{ cursor: 'pointer', accentColor: '#db3391' }}
                    />
                    <span
                      style={{
                        fontSize: '14px',
                        color: checkedIngredients[idx] ? '#aaa' : '#333',
                        textDecoration: checkedIngredients[idx] ? 'line-through' : 'none'
                      }}
                    >
                      {displayItem}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p style={{ color: '#888', fontSize: '14px' }}>No ingredients provided.</p>
          )}
        </div>

        {/* Step-by-Step Instructions */}
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#222' }}>
            Instructions
          </h2>
          {rawSteps.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {rawSteps.map((step, idx) => {
                const cleanStep = step.replace(/^(step\s*\d+[:.]?\s*|\d+[\.\)]\s*)/i, '');

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      gap: '14px',
                      padding: '16px',
                      backgroundColor: '#fff',
                      border: '1px solid #eee',
                      borderRadius: '12px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                    }}
                  >
                    <span
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: '#fce4ec',
                        color: '#db3391',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}
                    >
                      {idx + 1}
                    </span>
                    <p style={{ margin: 0, fontSize: '14px', color: '#444', lineHeight: '1.6' }}>
                      {cleanStep}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: '#888', fontSize: '14px' }}>No instructions provided.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;