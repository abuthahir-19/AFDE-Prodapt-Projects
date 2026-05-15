import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/complaints/new', label: 'New Complaint', icon: '➕', roles: ['Customer', 'Admin', 'Supervisor'] },
  { to: '/complaints', label: 'All Complaints', icon: '📋' },
  { to: '/work-queue', label: 'My Work Queue', icon: '🗂️', roles: ['Support Agent'] },
  { to: '/escalations', label: 'Escalations', icon: '🚨', roles: ['Admin', 'Supervisor'] },
  { to: '/reports', label: 'Reports', icon: '📈', roles: ['Admin', 'Supervisor', 'Quality Team'] },
  { to: '/users', label: 'User Management', icon: '👥', roles: ['Admin'] },
]

export default function Sidebar() {
  const { user } = useAuth()
  const role = user?.role

  return (
    <aside className="sidebar">
      <ul className="sidebar-menu">
        {NAV.filter(item => !item.roles || item.roles.includes(role)).map(item => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.end} className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  )
}
