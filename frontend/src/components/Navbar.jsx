import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, List, BarChart2, Upload, MessageSquare, Menu } from 'lucide-react';
import './Navbar.css';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }) => isActive ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <MessageSquare size={22} className="navbar-logo-icon" />
        <span className="navbar-title">FeedbackMS</span>
      </div>
      <button className="navbar-toggle" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
        <Menu size={22} />
      </button>
      <ul className={`navbar-links${menuOpen ? ' navbar-links--open' : ''}`}>
        <li>
          <NavLink to="/" end className={linkClass} onClick={() => setMenuOpen(false)}>
            <LayoutDashboard size={16} /> Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/submit" className={linkClass} onClick={() => setMenuOpen(false)}>
            <PlusCircle size={16} /> Submit Feedback
          </NavLink>
        </li>
        <li>
          <NavLink to="/feedback" className={linkClass} onClick={() => setMenuOpen(false)}>
            <List size={16} /> All Feedback
          </NavLink>
        </li>
        <li>
          <NavLink to="/analytics" className={linkClass} onClick={() => setMenuOpen(false)}>
            <BarChart2 size={16} /> Analytics
          </NavLink>
        </li>
        <li>
          <NavLink to="/import" className={linkClass} onClick={() => setMenuOpen(false)}>
            <Upload size={16} /> ETL Import
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
