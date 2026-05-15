import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/common/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

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

  if (loading) return <Layout><div className="loading">Loading dashboard...</div></Layout>

  const cards = [
    { label: 'Total Complaints', value: stats?.total ?? 0, color: '#1e40af', icon: '📋' },
    { label: 'Open', value: stats?.open ?? 0, color: '#3b82f6', icon: '🔓' },
    { label: 'In Progress', value: stats?.in_progress ?? 0, color: '#f59e0b', icon: '⚙️' },
    { label: 'Escalated', value: stats?.escalated ?? 0, color: '#ef4444', icon: '🚨' },
    { label: 'Resolved', value: stats?.resolved ?? 0, color: '#10b981', icon: '✅' },
    { label: 'SLA Breaches', value: stats?.sla_breaches ?? 0, color: '#dc2626', icon: '⏰' },
  ]

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Welcome back, <strong>{user?.name}</strong></p>
        </div>
        {['Customer', 'Admin', 'Supervisor'].includes(user?.role) && (
          <Link to="/complaints/new" className="btn btn-primary">+ New Complaint</Link>
        )}
      </div>

      <div className="stats-grid">
        {cards.map(card => (
          <div key={card.label} className="stat-card" style={{ borderTopColor: card.color }}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      {stats?.avg_resolution_hours != null && (
        <div className="info-banner">
          Average Resolution Time: <strong>{stats.avg_resolution_hours} hours</strong>
        </div>
      )}

      {trends.length > 0 && (
        <div className="chart-card">
          <h2>Monthly Complaint Trends (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Complaints" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Layout>
  )
}
