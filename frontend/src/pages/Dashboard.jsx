import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/common/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import {
  ClipboardList,
  FolderOpen,
  RefreshCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Timer,
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/dashboard/stats')
        setStats(data)
        if (['Admin', 'Supervisor', 'Quality Team'].includes(user?.role)) {
          const { data: t } = await api.get('/dashboard/trends')
          setTrends(t)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  if (loading) return <Layout><div className="loading"><div className="spinner" /> Loading dashboard...</div></Layout>

  const cards = [
    { label: 'Total Complaints', value: stats?.total ?? 0, color: '#1e40af', bg: '#dbeafe', Icon: ClipboardList },
    { label: 'Open', value: stats?.open ?? 0, color: '#3b82f6', bg: '#eff6ff', Icon: FolderOpen },
    { label: 'In Progress', value: stats?.in_progress ?? 0, color: '#f59e0b', bg: '#fef3c7', Icon: RefreshCcw },
    { label: 'Escalated', value: stats?.escalated ?? 0, color: '#ef4444', bg: '#fee2e2', Icon: AlertTriangle },
    { label: 'Resolved', value: stats?.resolved ?? 0, color: '#10b981', bg: '#dcfce7', Icon: CheckCircle2 },
    { label: 'SLA Breaches', value: stats?.sla_breaches ?? 0, color: '#dc2626', bg: '#fee2e2', Icon: Clock },
  ]

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Welcome back, <strong>{user?.name}</strong></p>
        </div>
        {['Customer', 'Admin', 'Supervisor'].includes(user?.role) && (
          <Link to="/complaints/new" className="btn btn-primary">
            <Plus size={15} />
            New Complaint
          </Link>
        )}
      </div>

      <div className="stats-grid">
        {cards.map(({ label, value, color, bg, Icon }) => (
          <div key={label} className="stat-card" style={{ borderTopColor: color }}>
            <div className="stat-icon-wrap" style={{ background: bg }}>
              <Icon size={22} color={color} />
            </div>
            <div className="stat-body">
              <div className="stat-value" style={{ color }}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {stats?.avg_resolution_hours != null && (
        <div className="info-banner">
          <Timer size={18} />
          Average Resolution Time: <strong>{stats.avg_resolution_hours} hours</strong>
        </div>
      )}

      {trends.length > 0 && (
        <div className="chart-card">
          <h2>Monthly Complaint Trends (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,.08)' }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Complaints" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Layout>
  )
}
