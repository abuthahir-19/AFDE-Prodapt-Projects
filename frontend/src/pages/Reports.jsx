import React, { useState, useEffect } from 'react'
import Layout from '../components/common/Layout'
import api from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

export default function Reports() {
  const [trends, setTrends] = useState([])
  const [catStats, setCatStats] = useState([])
  const [agentPerf, setAgentPerf] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/trends'),
      api.get('/dashboard/category-stats'),
      api.get('/dashboard/agent-performance'),
    ])
      .then(([t, c, a]) => { setTrends(t.data); setCatStats(c.data); setAgentPerf(a.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Layout><div className="loading">Loading reports...</div></Layout>

  return (
    <Layout>
      <div className="page-header">
        <h1>Reports &amp; Analytics</h1>
      </div>

      <div className="reports-grid">
        <div className="chart-card">
          <h2>Monthly Complaint Trends</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Complaints" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Complaints by Category</h2>
          {catStats.filter(c => c.count > 0).length === 0 ? (
            <div className="empty-state">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={catStats.filter(c => c.count > 0)}
                  dataKey="count"
                  nameKey="category"
                  outerRadius={100}
                  label={({ category, count }) => `${category.split(' ')[0]}: ${count}`}
                >
                  {catStats.filter(c => c.count > 0).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card full-width">
          <h2>Agent Performance</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Total Assigned</th>
                <th>Resolved</th>
                <th>Resolution Rate</th>
              </tr>
            </thead>
            <tbody>
              {agentPerf.length === 0 ? (
                <tr><td colSpan={4} className="empty-state">No agent data available</td></tr>
              ) : agentPerf.map(a => (
                <tr key={a.agent_id}>
                  <td><strong>{a.agent_name}</strong></td>
                  <td>{a.total_assigned}</td>
                  <td>{a.resolved}</td>
                  <td>
                    <div className="progress-wrap">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${a.resolution_rate}%`, backgroundColor: a.resolution_rate >= 75 ? '#10b981' : a.resolution_rate >= 50 ? '#f59e0b' : '#ef4444' }} />
                      </div>
                      <span className="progress-label">{a.resolution_rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
