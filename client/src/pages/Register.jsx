import React, { useState } from 'react';
import axios from 'axios';

// Live Render backend registration endpoint
const REGISTER_URL = 'https://menuu-book.onrender.com/api/auth/register';

const Register = ({ onRegisterSuccess, switchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(REGISTER_URL, {
        name: formData.username,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // Save token and user info if returned
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user || {}));
      }

      setLoading(false);

      if (onRegisterSuccess) {
        onRegisterSuccess(response.data);
      } else if (switchToLogin) {
        switchToLogin();
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      setLoading(false);
      const message =
        err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
    }
  };

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '60px auto',
        padding: '24px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        fontFamily: 'sans-serif',
      }}
    >
      <h2 style={{ marginBottom: '8px' }}>Create an Account</h2>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
        Sign up to save and manage your favorite recipes
      </p>

      {error && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '14px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Username
          </label>
          <input
            type="text"
            name="username"
            required
            value={formData.username}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Email Address
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Password
          </label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#a05a2c',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
        Already have an account?{' '}
        <span
          onClick={switchToLogin}
          style={{ color: '#a05a2c', cursor: 'pointer', fontWeight: '500' }}
        >
          Sign In
        </span>
      </p>
    </div>
  );
};

export default Register;