import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowLeftRight,
  Search,
  BarChart3,
  Library,
  DatabaseZap,
} from "lucide-react";
import "./Navbar.css";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/books", label: "Books", icon: BookOpen },
  { to: "/borrowers", label: "Borrowers", icon: Users },
  { to: "/borrow-return", label: "Borrow / Return", icon: ArrowLeftRight },
  { to: "/search", label: "Search", icon: Search },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/etl", label: "ETL Pipeline", icon: DatabaseZap },
];

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="brand-logo">
          <Library size={22} />
        </div>
        <div className="brand-text">
          <span className="brand-name">LibraryMS</span>
          <span className="brand-sub">Management System</span>
        </div>
      </div>

      <ul className="navbar-links">
        {links.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink to={to} end={end}>
              <Icon size={15} strokeWidth={2.2} />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
