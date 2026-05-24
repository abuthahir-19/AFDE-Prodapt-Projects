import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LogOut, Target } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <div className="brand-icon-wrap">
            <Target size={20} color="#fff" />
          </div>
          <span className="brand-text">CCRS</span>
        </Link>
        <span className="brand-subtitle">Complaint &amp; Resolution Tracking</span>
      </div>
      <div className="navbar-user">
        <div className="user-info">
          <span className="user-name">{user?.name}</span>
          <span className={`role-badge role-${user?.role?.toLowerCase().replace(' ', '-')}`}>{user?.role}</span>
        </div>
        <div className="user-avatar">{initials}</div>
        <button onClick={handleLogout} className="btn-logout">
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </nav>
  )
}
