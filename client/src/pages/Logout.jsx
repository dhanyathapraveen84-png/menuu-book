import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Clear session data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // 2. Redirect to login page after 1.5 seconds
    const timer = setTimeout(() => {
      navigate('/login');
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '32px', textAlign: 'center', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>
        Logging Out...
      </h2>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
        You have been signed out. Redirecting to login...
      </p>
      <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid #e5e7eb', borderTop: '3px solid #a05a2c', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Logout;