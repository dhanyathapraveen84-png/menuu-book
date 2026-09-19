import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const Layout = () => {
  const navigate = useNavigate();

  // Retrieve user data from localStorage, handling either a string or JSON object
  const storedUser = localStorage.getItem('user');
  let parsedEmail = '';
  let parsedName = '';

  try {
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      parsedEmail = parsed.email || '';
      parsedName = parsed.name || '';
    }
  } catch (e) {
    // If user is stored as plain string
  }

  const userEmail = parsedEmail || localStorage.getItem('userEmail') || 'user@example.com';
  const userName = parsedName || userEmail.split('@')[0];

  const handleLogout = () => {
    // Navigate to dedicated Logout page (Logout.jsx clears localStorage and redirects)
    navigate('/logout');
  };

  const navItems = [
    { name: 'Browse Recipes', path: '/', icon: '🍽️' },
    { name: 'Favorites', path: '/favorites', icon: '❤️' },
    { name: 'My Recipes', path: '/my-recipes', icon: '📖' },
    { name: 'Add Recipe', path: '/add-recipe', icon: '➕' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fdfdfd', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #f0f0f0',
          display: 'flex',
          flexDirection: 'column',
          padding: '28px 20px',
          boxSizing: 'border-box',
          position: 'sticky',
          top: 0,
          height: '100vh'
        }}
      >
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px', paddingLeft: '8px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#db3391',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            M
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#1a1a1a' }}>Menu Book</h2>
            <span style={{ fontSize: '11px', color: '#999' }}>Recipe Manager</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: isActive ? '600' : '500',
                backgroundColor: isActive ? '#fce4ec' : 'transparent',
                color: isActive ? '#db3391' : '#555',
                transition: 'all 0.15s ease'
              })}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Account & Sign Out Section */}
        <div
          style={{
            borderTop: '1px solid #f0f0f0',
            paddingTop: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', flex: 1 }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#fce4ec',
                color: '#db3391',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                flexShrink: 0
              }}
            >
              {userName.charAt(0)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#333',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden'
                }}
              >
                {userName}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: '11px',
                  color: '#888',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden'
                }}
              >
                {userEmail}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign out"
            style={{
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: '6px',
              color: '#e11d48',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0
            }}
          >
            <span>🚪</span>
            <span>Exit</span>
          </button>
        </div>
      </aside>

      {/* Main App Page Content */}
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#fafafa', minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;