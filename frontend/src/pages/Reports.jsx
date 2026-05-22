import React, { useState, useEffect } from 'react'
import Layout from '../components/common/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line, CartesianGrid,
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

const PRIORITY_COLOR = {
  Critical: '#ef4444',
  High: '#f59e0b',
  Medium: '#3b82f6',
  Low: '#10b981',
}

export default function Reports() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'
  const canSeeAgents = ['Admin', 'Supervisor'].includes(user?.role)

  const [activeTab, setActiveTab] = useState('overview')

  const [trends, setTrends] = useState([])
  const [catStats, setCatStats] = useState([])
  const [slaReport, setSlaReport] = useState([])
  const [resolutionTrends, setResolutionTrends] = useState([])
  const [agentPerf, setAgentPerf] = useState([])
  const [etlStatus, setEtlStatus] = useState(null)
  const [etlRunning, setEtlRunning] = useState(false)
  const [etlMessage, setEtlMessage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetches = [
      api.get('/dashboard/trends'),
      api.get('/dashboard/category-stats'),
      api.get('/analytics/sla-report'),
      api.get('/analytics/resolution-trends'),
      api.get('/analytics/etl-status'),
    ]
    if (canSeeAgents) fetches.push(api.get('/analytics/agent-performance'))

    Promise.allSettled(fetches).then((results) => {
      if (results[0].status === 'fulfilled') setTrends(results[0].value.data)
      if (results[1].status === 'fulfilled') setCatStats(results[1].value.data)
      if (results[2].status === 'fulfilled') setSlaReport(results[2].value.data)
      if (results[3].status === 'fulfilled') setResolutionTrends(results[3].value.data)
      if (results[4].status === 'fulfilled') setEtlStatus(results[4].value.data)
      if (canSeeAgents && results[5]?.status === 'fulfilled') setAgentPerf(results[5].value.data)
      setLoading(false)
    })
  }, [canSeeAgents])

  const runEtl = async () => {
    setEtlRunning(true)
    setEtlMessage(null)
    try {
      const { data } = await api.post('/analytics/run-etl')
      setEtlMessage({
        type: 'success',
        text: `ETL complete — ${data.records_processed} records processed in ${data.duration_seconds}s`,
      })
      const [sla, res, status] = await Promise.all([
        api.get('/analytics/sla-report'),
        api.get('/analytics/resolution-trends'),
        api.get('/analytics/etl-status'),
      ])
      setSlaReport(sla.data)
      setResolutionTrends(res.data)
      setEtlStatus(status.data)
      if (canSeeAgents) {
        const perf = await api.get('/analytics/agent-performance')
        setAgentPerf(perf.data)
      }
    } catch (err) {
      setEtlMessage({ type: 'error', text: err.response?.data?.detail || 'ETL failed' })
    } finally {
      setEtlRunning(false)
    }
  }

  const slaByCategory = Object.values(
    slaReport.reduce((acc, row) => {
      if (!acc[row.category]) acc[row.category] = { category: row.category, total: 0, breached: 0 }
      acc[row.category].total += row.total
      acc[row.category].breached += row.breached
      return acc
    }, {})
  )

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'sla', label: 'SLA Analysis' },
    { key: 'resolution', label: 'Resolution Trends' },
    ...(canSeeAgents ? [{ key: 'agents', label: 'Agent Performance' }] : []),
  ]

  if (loading) return <Layout><div className="loading">Loading reports...</div></Layout>

  return (
    <Layout>
      <div className="page-header">
        <h1>Reports &amp; Analytics</h1>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '0' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '8px 18px',
              border: 'none',
              background: activeTab === tab.key ? '#3b82f6' : 'transparent',
              color: activeTab === tab.key ? '#fff' : '#374151',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              borderRadius: '6px 6px 0 0',
              borderBottom: activeTab === tab.key ? '2px solid #3b82f6' : '2px solid transparent',
              marginBottom: '-2px',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
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
        </div>
      )}

      {/* ── SLA Analysis Tab ── */}
      {activeTab === 'sla' && (
        <div>
          <div className="chart-card" style={{ marginBottom: '16px' }}>
            <h2>SLA Breach Count by Category</h2>
            {slaByCategory.length === 0 ? (
              <div className="empty-state">No data — run ETL first</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={slaByCategory} margin={{ top: 10, right: 20, left: 0, bottom: 50 }}>
                  <XAxis dataKey="category" angle={-20} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#3b82f6" name="Total" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="breached" fill="#ef4444" name="Breached" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="chart-card">
            <h2>SLA Breach Detail</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Total</th>
                  <th>Breached</th>
                  <th>Breach Rate</th>
                  <th>Avg Breach Hours</th>
                </tr>
              </thead>
              <tbody>
                {slaReport.length === 0 ? (
                  <tr><td colSpan={6} className="empty-state">No data — run ETL first</td></tr>
                ) : slaReport.map((r, i) => (
                  <tr key={i}>
                    <td>{r.category}</td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: '12px',
                        background: (PRIORITY_COLOR[r.priority] || '#6b7280') + '22',
                        color: PRIORITY_COLOR[r.priority] || '#6b7280',
                      }}>
                        {r.priority}
                      </span>
                    </td>
                    <td>{r.total}</td>
                    <td><strong style={{ color: r.breached > 0 ? '#ef4444' : 'inherit' }}>{r.breached}</strong></td>
                    <td>{r.breach_rate}%</td>
                    <td>{r.avg_breach_hours != null ? `${r.avg_breach_hours}h` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Resolution Trends Tab ── */}
      {activeTab === 'resolution' && (
        <div>
          <div className="chart-card" style={{ marginBottom: '16px' }}>
            <h2>Avg Resolution Hours &amp; SLA Breaches by Month</h2>
            {resolutionTrends.length === 0 ? (
              <div className="empty-state">No data — run ETL first</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={resolutionTrends} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avg_resolution_hours"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Avg Resolution Hours"
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="breach_count"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="SLA Breaches"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="chart-card">
            <h2>Monthly Resolution Summary</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Total Complaints</th>
                  <th>Avg Resolution Hours</th>
                  <th>SLA Breaches</th>
                </tr>
              </thead>
              <tbody>
                {resolutionTrends.length === 0 ? (
                  <tr><td colSpan={4} className="empty-state">No data</td></tr>
                ) : resolutionTrends.map((r, i) => (
                  <tr key={i}>
                    <td><strong>{r.month}</strong></td>
                    <td>{r.total_complaints}</td>
                    <td>{r.avg_resolution_hours != null ? `${r.avg_resolution_hours}h` : '—'}</td>
                    <td style={{ color: r.breach_count > 0 ? '#ef4444' : 'inherit' }}>
                      {r.breach_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Agent Performance Tab ── */}
      {activeTab === 'agents' && canSeeAgents && (
        <div className="chart-card">
          <h2>Agent Performance</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Total Assigned</th>
                <th>Resolved</th>
                <th>Resolution Rate</th>
                <th>Avg Resolution Hours</th>
                <th>SLA Breaches</th>
              </tr>
            </thead>
            <tbody>
              {agentPerf.length === 0 ? (
                <tr><td colSpan={6} className="empty-state">No data — run ETL first</td></tr>
              ) : agentPerf.map((a, i) => (
                <tr key={i}>
                  <td><strong>{a.agent_name}</strong></td>
                  <td>{a.total_assigned}</td>
                  <td>{a.resolved}</td>
                  <td>
                    <div className="progress-wrap">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${a.resolution_rate}%`,
                            backgroundColor:
                              a.resolution_rate >= 75 ? '#10b981' :
                              a.resolution_rate >= 50 ? '#f59e0b' : '#ef4444',
                          }}
                        />
                      </div>
                      <span className="progress-label">{a.resolution_rate}%</span>
                    </div>
                  </td>
                  <td>{a.avg_resolution_hours != null ? `${a.avg_resolution_hours}h` : '—'}</td>
                  <td>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      fontSize: '12px',
                      background: a.breach_count > 0 ? '#fef2f2' : '#f0fdf4',
                      color: a.breach_count > 0 ? '#ef4444' : '#10b981',
                    }}>
                      {a.breach_count}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── ETL Panel (Admin only) ── */}
      {isAdmin && (
        <div className="chart-card" style={{ marginTop: '24px', borderLeft: '4px solid #3b82f6' }}>
          <h2 style={{ marginBottom: '12px' }}>ETL Pipeline Control</h2>
          {etlMessage && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '6px',
              marginBottom: '12px',
              background: etlMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
              color: etlMessage.type === 'success' ? '#16a34a' : '#dc2626',
              fontSize: '13px',
              fontWeight: 500,
            }}>
              {etlMessage.text}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={runEtl} disabled={etlRunning}>
              {etlRunning ? 'Running ETL...' : 'Run ETL'}
            </button>
            {etlStatus && !etlStatus.message ? (
              <span style={{ fontSize: '13px', color: '#6b7280' }}>
                Last run: <strong>{new Date(etlStatus.run_at).toLocaleString()}</strong>
                {' — '}
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '12px',
                  background: etlStatus.status === 'success' ? '#f0fdf4' : '#fef2f2',
                  color: etlStatus.status === 'success' ? '#10b981' : '#ef4444',
                }}>
                  {etlStatus.status}
                </span>
                {' — '}
                {etlStatus.records_processed} records in {etlStatus.duration_seconds}s
              </span>
            ) : (
              <span style={{ fontSize: '13px', color: '#6b7280' }}>No ETL runs yet</span>
            )}
          </div>
        </div>
      )}
    </Layout>
  )
}
