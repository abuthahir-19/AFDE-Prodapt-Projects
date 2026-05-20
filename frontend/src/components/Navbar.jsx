import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const navLinkStyle = (path) => ({
    color: location.pathname === path ? '#fff' : 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    fontWeight: location.pathname === path ? '600' : '400',
    backgroundColor: location.pathname === path ? 'rgba(255,255,255,0.2)' : 'transparent',
    transition: 'all 0.2s',
  });

  return (
    <nav
      style={{
        backgroundColor: '#1976d2',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        height: '64px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginRight: '32px',
        }}
      >
        <span style={{ fontSize: '22px' }}>🎫</span>
        <Link
          to="/"
          style={{
            color: '#fff',
            textDecoration: 'none',
            fontSize: '20px',
            fontWeight: '700',
            letterSpacing: '0.5px',
          }}
        >
          Helpdesk System
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <Link to="/" style={navLinkStyle('/')}>
          Dashboard
        </Link>
        <Link to="/tickets" style={navLinkStyle('/tickets')}>
          All Tickets
        </Link>
        <Link to="/tickets/new" style={navLinkStyle('/tickets/new')}>
          + Create Ticket
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
