import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <span className="brand-icon">🎯</span>
          <span className="brand-text">CCRS</span>
        </Link>
        <span className="brand-subtitle">Complaint &amp; Resolution Tracking</span>
      </div>
      <div className="navbar-user">
        <span className="user-name">{user?.name}</span>
        <span className={`role-badge role-${user?.role?.toLowerCase().replace(' ', '-')}`}>{user?.role}</span>
        <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
      </div>
    </nav>
  )
}
