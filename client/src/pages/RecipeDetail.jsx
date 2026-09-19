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

  // Review & Rating State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

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

  useEffect(() => {
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

    return itemStr.replace(/(\d+\/\d+|\d+(\.\d+)?)/g, (match) => {
      let val = 0;
      if (match.includes('/')) {
        const [num, den] = match.split('/').map(Number);
        val = num / den;
      } else {
        val = parseFloat(match);
      }

      const scaled = val * factor;
      return Number.isInteger(scaled) ? scaled.toString() : scaled.toFixed(2).replace(/\.?0+$/, '');
    });
  };

  // Handle Review Submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');

    if (!comment.trim()) {
      setReviewError('Please provide a comment for your review.');
      return;
    }

    setSubmittingReview(true);
    try {
      // Retrieve logged-in username or fallback
      let reviewerName = 'Anonymous Foodie';
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          reviewerName = parsed.name || parsed.email?.split('@')[0] || 'Anonymous';
        } catch (err) {
          reviewerName = storedUser;
        }
      } else {
        const storedEmail = localStorage.getItem('userEmail');
        if (storedEmail) reviewerName = storedEmail.split('@')[0];
      }

      const res = await axios.post(`https://menuu-book.onrender.com/api/recipes/${id}/reviews`, {
        rating: Number(rating),
        comment: comment.trim(),
        user: reviewerName
      });

      if (res.data && res.data.recipe) {
        setRecipe(res.data.recipe);
      } else {
        await fetchRecipe();
      }

      setComment('');
      setRating(5);
    } catch (err) {
      console.error('Review submit error:', err);
      setReviewError(err.response?.data?.message || 'Failed to submit review. Try again.');
    } finally {
      setSubmittingReview(false);
    }
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
  const avgRating = recipe.averageRating ? Number(recipe.averageRating).toFixed(1) : 'New';
  const totalReviews = recipe.numReviews || (recipe.reviews ? recipe.reviews.length : 0);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '6px 14px',
                backgroundColor: '#fce4ec',
                color: '#db3391',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}
            >
              {recipe.category || 'General'}
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                backgroundColor: '#fffbeb',
                color: '#b45309',
                border: '1px solid #fde68a',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              ⭐ {avgRating} ({totalReviews})
            </span>
          </div>

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
              alignItems: 'center',
              flexWrap: 'wrap'
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
          gap: '36px',
          marginBottom: '50px'
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

      {/* --- Ratings & Reviews Section --- */}
      <div style={{ borderTop: '1px solid #eaeaea', paddingTop: '36px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '20px' }}>
          Reviews & Ratings
        </h2>

        {/* Review Form */}
        <form
          onSubmit={handleReviewSubmit}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '36px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginTop: 0, marginBottom: '14px' }}>
            Leave your feedback
          </h3>

          {reviewError && (
            <div
              style={{
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px'
              }}
            >
              {reviewError}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' }}>
              Your Rating
            </label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                backgroundColor: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value="5">⭐⭐⭐⭐⭐ (5 - Delicious / Perfect)</option>
              <option value="4">⭐⭐⭐⭐ (4 - Very Good)</option>
              <option value="3">⭐⭐⭐ (3 - Good / Average)</option>
              <option value="2">⭐⭐ (2 - Needs Improvement)</option>
              <option value="1">⭐ (1 - Did not like it)</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' }}>
              Comment
            </label>
            <textarea
              rows="3"
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Did you change any ingredients? How did it taste?"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submittingReview}
            style={{
              padding: '10px 20px',
              backgroundColor: '#db3391',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: submittingReview ? 'not-allowed' : 'pointer',
              opacity: submittingReview ? 0.7 : 1
            }}
          >
            {submittingReview ? 'Submitting...' : 'Post Review'}
          </button>
        </form>

        {/* Reviews List */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#222', marginBottom: '16px' }}>
            Customer Feedback ({totalReviews})
          </h3>

          {!recipe.reviews || recipe.reviews.length === 0 ? (
            <p style={{ color: '#888', fontSize: '14px' }}>
              No reviews yet for this recipe. Be the first to cook it and leave a rating!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {recipe.reviews.map((rev, index) => (
                <div
                  key={rev._id || index}
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #eee',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '14px', color: '#333' }}>
                      {rev.user || 'Anonymous'}
                    </strong>
                    <span style={{ color: '#f59e0b', fontSize: '14px', letterSpacing: '2px' }}>
                      {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#555', lineHeight: '1.5' }}>
                    {rev.comment}
                  </p>
                  {rev.createdAt && (
                    <span style={{ fontSize: '11px', color: '#aaa', display: 'block', marginTop: '6px' }}>
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;