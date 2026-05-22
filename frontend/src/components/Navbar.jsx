import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }) => isActive ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">&#128172;</span>
        <span className="navbar-title">FeedbackMS</span>
      </div>
      <button className="navbar-toggle" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
        &#9776;
      </button>
      <ul className={`navbar-links${menuOpen ? ' navbar-links--open' : ''}`}>
        <li>
          <NavLink to="/" end className={linkClass} onClick={() => setMenuOpen(false)}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/submit" className={linkClass} onClick={() => setMenuOpen(false)}>
            Submit Feedback
          </NavLink>
        </li>
        <li>
          <NavLink to="/feedback" className={linkClass} onClick={() => setMenuOpen(false)}>
            All Feedback
          </NavLink>
        </li>
        <li>
          <NavLink to="/analytics" className={linkClass} onClick={() => setMenuOpen(false)}>
            Analytics
          </NavLink>
        </li>
        <li>
          <NavLink to="/import" className={linkClass} onClick={() => setMenuOpen(false)}>
            ETL Import
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
