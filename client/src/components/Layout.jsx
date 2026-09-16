import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const Layout = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItemStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '10px',
    textDecoration: 'none',
    color: isActive ? '#b3391b' : '#555',
    backgroundColor: isActive ? '#fdf2ef' : 'transparent',
    fontWeight: isActive ? '600' : '400',
    fontSize: '15px',
    transition: 'background-color 0.2s',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fcfbf9' }}>
      {/* Left Sidebar */}
      <aside
        style={{
          width: '240px',
          borderRight: '1px solid #eee',
          padding: '28px 20px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
        }}
      >
        <div style={{ marginBottom: '36px', paddingLeft: '8px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111', margin: 0 }}>
            Culina AI
          </h2>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <NavLink to="/" end style={navItemStyle}>
            <span>🍳</span> Browse Recipes
          </NavLink>

          <NavLink to="/favorites" style={navItemStyle}>
            <span>🤍</span> Favorites
          </NavLink>

          <NavLink to="/my-recipes" style={navItemStyle}>
            <span>📖</span> My Recipes
          </NavLink>

          <NavLink to="/add-recipe" style={navItemStyle}>
            <span>➕</span> Add Recipe
          </NavLink>
        </nav>

        <div style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
          {token ? (
            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                color: '#666',
                fontWeight: '500',
              }}
            >
              Log Out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#b3391b',
                cursor: 'pointer',
                color: '#fff',
                fontWeight: '500',
              }}
            >
              Log In
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;