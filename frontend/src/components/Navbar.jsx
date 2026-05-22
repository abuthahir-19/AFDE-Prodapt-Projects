import { NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">📚</span>
        <span className="brand-name">Library MS</span>
      </div>
      <ul className="navbar-links">
        <li><NavLink to="/" end>Dashboard</NavLink></li>
        <li><NavLink to="/books">Books</NavLink></li>
        <li><NavLink to="/borrowers">Borrowers</NavLink></li>
        <li><NavLink to="/borrow-return">Borrow / Return</NavLink></li>
        <li><NavLink to="/search">Search</NavLink></li>
        <li><NavLink to="/analytics">Analytics</NavLink></li>
      </ul>
    </nav>
  );
}
