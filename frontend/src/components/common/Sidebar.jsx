import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  ListChecks,
  AlertTriangle,
  BarChart2,
  Users,
} from 'lucide-react'

const NAV = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/complaints/new', label: 'New Complaint', Icon: PlusCircle, roles: ['Customer', 'Admin', 'Supervisor'] },
  { to: '/complaints', label: 'All Complaints', Icon: ClipboardList, end: true },
  { to: '/work-queue', label: 'My Work Queue', Icon: ListChecks, roles: ['Support Agent'] },
  { to: '/escalations', label: 'Escalations', Icon: AlertTriangle, roles: ['Admin', 'Supervisor'] },
  { to: '/reports', label: 'Reports', Icon: BarChart2, roles: ['Admin', 'Supervisor', 'Quality Team'] },
  { to: '/users', label: 'User Management', Icon: Users, roles: ['Admin'] },
]

export default function Sidebar() {
  const { user } = useAuth()
  const role = user?.role
  const items = NAV.filter(item => !item.roles || item.roles.includes(role))

  return (
    <aside className="sidebar">
      <ul className="sidebar-menu">
        {items.map(({ to, label, Icon, end }) => (
          <li key={to}>
            <NavLink to={to} end={end} className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="nav-icon"><Icon size={17} /></span>
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  )
}
