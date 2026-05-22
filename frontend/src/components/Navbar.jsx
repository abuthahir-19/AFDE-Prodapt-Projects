import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HeadsetIcon, DashboardIcon, TicketsIcon, AddIcon, BarChartIcon, UploadIcon } from './Icons';

const NavLink = ({ to, icon, label, active }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: active ? '#fff' : 'rgba(255,255,255,0.82)',
        padding: '7px 14px',
        borderRadius: '8px',
        fontWeight: active ? '600' : '500',
        fontSize: '14px',
        letterSpacing: '0.1px',
        backgroundColor: active
          ? 'rgba(255,255,255,0.18)'
          : hovered
          ? 'rgba(255,255,255,0.10)'
          : 'transparent',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
        borderBottom: active ? '2px solid rgba(255,255,255,0.7)' : '2px solid transparent',
      }}
    >
      {icon}
      {label}
    </Link>
  );
};

const Navbar = () => {
  const location = useLocation();
  const is = (path) => location.pathname === path;

  return (
    <nav
      style={{
        background: 'linear-gradient(135deg, #1251a3 0%, #1976d2 60%, #1e88e5 100%)',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        height: '62px',
        boxShadow: '0 2px 12px rgba(25, 118, 210, 0.35)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: '8px',
      }}
    >
      {/* Brand */}
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginRight: '28px',
          textDecoration: 'none',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '9px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          <HeadsetIcon size={19} />
        </div>
        <div>
          <div style={{ color: '#fff', fontSize: '15px', fontWeight: '700', lineHeight: '1.2', letterSpacing: '0.2px' }}>
            Helpdesk
          </div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '10px', fontWeight: '500', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Ticket System
          </div>
        </div>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '2px', alignItems: 'center', flexWrap: 'wrap' }}>
        <NavLink to="/" icon={<DashboardIcon size={15} />} label="Dashboard" active={is('/')} />
        <NavLink to="/tickets" icon={<TicketsIcon size={15} />} label="All Tickets" active={is('/tickets')} />
        <NavLink to="/tickets/new" icon={<AddIcon size={15} />} label="Create Ticket" active={is('/tickets/new')} />
        <NavLink to="/analytics" icon={<BarChartIcon size={15} />} label="Analytics" active={is('/analytics')} />
        <NavLink to="/etl" icon={<UploadIcon size={15} />} label="ETL Import" active={is('/etl')} />
      </div>
    </nav>
  );
};

export default Navbar;
