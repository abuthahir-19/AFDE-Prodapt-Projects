import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">&#128172;</span>
        <span className="navbar-title">FeedbackMS</span>
      </div>
      <ul className="navbar-links">
        <li>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/submit" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Submit Feedback
          </NavLink>
        </li>
        <li>
          <NavLink to="/feedback" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            All Feedback
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
