import React, { useState, useEffect } from 'react'
import Layout from '../components/common/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line, CartesianGrid,
} from 'recharts'
import {
  Play, CheckCircle2, XCircle, Clock, RefreshCcw,
  Database, Zap, BarChart2, AlertTriangle,
} from 'lucide-react'

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

  const fetchAll = async () => {
    const fetches = [
      api.get('/dashboard/trends'),
      api.get('/dashboard/category-stats'),
      api.get('/analytics/sla-report'),
      api.get('/analytics/resolution-trends'),
      api.get('/analytics/etl-status'),
    ]
    if (canSeeAgents) fetches.push(api.get('/analytics/agent-performance'))

    const results = await Promise.allSettled(fetches)
    if (results[0].status === 'fulfilled') setTrends(results[0].value.data)
    if (results[1].status === 'fulfilled') setCatStats(results[1].value.data)
    if (results[2].status === 'fulfilled') setSlaReport(results[2].value.data)
    if (results[3].status === 'fulfilled') setResolutionTrends(results[3].value.data)
    if (results[4].status === 'fulfilled') setEtlStatus(results[4].value.data)
    if (canSeeAgents && results[5]?.status === 'fulfilled') setAgentPerf(results[5].value.data)
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [canSeeAgents])

  const runEtl = async () => {
    setEtlRunning(true)
    setEtlMessage(null)
    try {
      const { data } = await api.post('/analytics/run-etl')
      setEtlMessage({ type: 'success', text: `ETL completed — ${data.records_processed} records processed in ${data.duration_seconds}s` })
      await fetchAll()
    } catch (err) {
      setEtlMessage({ type: 'error', text: err.response?.data?.detail || 'ETL pipeline failed' })
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
    { key: 'overview', label: 'Overview', icon: <BarChart2 size={14} /> },
    { key: 'sla', label: 'SLA Analysis', icon: <Clock size={14} /> },
    { key: 'resolution', label: 'Resolution Trends', icon: <RefreshCcw size={14} /> },
    ...(canSeeAgents ? [{ key: 'agents', label: 'Agent Performance', icon: <CheckCircle2 size={14} /> }] : []),
    ...(isAdmin ? [{ key: 'etl', label: 'ETL Pipeline', icon: <Database size={14} /> }] : []),
  ]

  if (loading) return <Layout><div className="loading"><div className="spinner" /> Loading reports...</div></Layout>

  const hasEtlData = etlStatus && !etlStatus.message

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Reports &amp; Analytics</h1>
          <p className="page-subtitle">
            {hasEtlData
              ? `Data last refreshed ${new Date(etlStatus.run_at).toLocaleString()}`
              : 'Run ETL to populate analytics data'}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="reports-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`reports-tab-btn${activeTab === tab.key ? ' active' : ''}`}
          >
            {tab.icon}
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
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[5, 5, 0, 0]} name="Complaints" />
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
          {!hasEtlData && <div className="alert alert-warning"><AlertTriangle size={16} /> No ETL data found. Go to the ETL Pipeline tab and run the pipeline first.</div>}
          <div className="chart-card" style={{ marginBottom: '16px' }}>
            <h2>SLA Breach Count by Category</h2>
            {slaByCategory.length === 0 ? (
              <div className="empty-state">No data — run ETL first</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={slaByCategory} margin={{ top: 10, right: 20, left: 0, bottom: 50 }}>
                  <XAxis dataKey="category" angle={-20} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
                  <Legend />
                  <Bar dataKey="total" fill="#3b82f6" name="Total" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="breached" fill="#ef4444" name="Breached" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="chart-card">
            <h2>SLA Breach Detail</h2>
            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category</th><th>Priority</th><th>Total</th>
                    <th>Breached</th><th>Breach Rate</th><th>Avg Breach Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {slaReport.length === 0 ? (
                    <tr><td colSpan={6} className="empty-state">No data — run ETL first</td></tr>
                  ) : slaReport.map((r, i) => (
                    <tr key={i}>
                      <td>{r.category}</td>
                      <td>
                        <span className="badge" style={{
                          background: (PRIORITY_COLOR[r.priority] || '#6b7280') + '22',
                          color: PRIORITY_COLOR[r.priority] || '#6b7280',
                        }}>{r.priority}</span>
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
        </div>
      )}

      {/* ── Resolution Trends Tab ── */}
      {activeTab === 'resolution' && (
        <div>
          {!hasEtlData && <div className="alert alert-warning"><AlertTriangle size={16} /> No ETL data found. Run the ETL pipeline first.</div>}
          <div className="chart-card" style={{ marginBottom: '16px' }}>
            <h2>Avg Resolution Hours &amp; SLA Breaches by Month</h2>
            {resolutionTrends.length === 0 ? (
              <div className="empty-state">No data — run ETL first</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={resolutionTrends} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
                  <Legend />
                  <Line type="monotone" dataKey="avg_resolution_hours" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Avg Resolution Hours" connectNulls />
                  <Line type="monotone" dataKey="breach_count" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="SLA Breaches" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="chart-card">
            <h2>Monthly Resolution Summary</h2>
            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr><th>Month</th><th>Total Complaints</th><th>Avg Resolution Hours</th><th>SLA Breaches</th></tr>
                </thead>
                <tbody>
                  {resolutionTrends.length === 0 ? (
                    <tr><td colSpan={4} className="empty-state">No data</td></tr>
                  ) : resolutionTrends.map((r, i) => (
                    <tr key={i}>
                      <td><strong>{r.month}</strong></td>
                      <td>{r.total_complaints}</td>
                      <td>{r.avg_resolution_hours != null ? `${r.avg_resolution_hours}h` : '—'}</td>
                      <td style={{ color: r.breach_count > 0 ? '#ef4444' : '#166534', fontWeight: 600 }}>{r.breach_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Agent Performance Tab ── */}
      {activeTab === 'agents' && canSeeAgents && (
        <div>
          {!hasEtlData && <div className="alert alert-warning"><AlertTriangle size={16} /> No ETL data found. Run the ETL pipeline first.</div>}
          <div className="chart-card">
            <h2>Agent Performance</h2>
            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Agent</th><th>Total Assigned</th><th>Resolved</th>
                    <th>Resolution Rate</th><th>Avg Resolution Hours</th><th>SLA Breaches</th>
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
                            <div className="progress-fill" style={{
                              width: `${a.resolution_rate}%`,
                              backgroundColor: a.resolution_rate >= 75 ? '#10b981' : a.resolution_rate >= 50 ? '#f59e0b' : '#ef4444',
                            }} />
                          </div>
                          <span className="progress-label">{a.resolution_rate}%</span>
                        </div>
                      </td>
                      <td>{a.avg_resolution_hours != null ? `${a.avg_resolution_hours}h` : '—'}</td>
                      <td>
                        <span className="badge" style={{
                          background: a.breach_count > 0 ? '#fef2f2' : '#f0fdf4',
                          color: a.breach_count > 0 ? '#ef4444' : '#10b981',
                        }}>{a.breach_count}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── ETL Pipeline Tab (Admin only) ── */}
      {activeTab === 'etl' && isAdmin && (
        <div>
          {/* Status Message */}
          {etlMessage && (
            <div className={`alert ${etlMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {etlMessage.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {etlMessage.text}
            </div>
          )}

          {/* Status Cards */}
          <div className="etl-status-grid">
            <div className="etl-stat-card">
              <div className="etl-stat-icon" style={{ background: hasEtlData && etlStatus.status === 'success' ? '#dcfce7' : '#fef3c7' }}>
                {hasEtlData && etlStatus.status === 'success'
                  ? <CheckCircle2 size={22} color="#16a34a" />
                  : <Clock size={22} color="#b45309" />}
              </div>
              <div>
                <div className="etl-stat-label">Pipeline Status</div>
                <div className="etl-stat-value">
                  {hasEtlData
                    ? <span style={{ color: etlStatus.status === 'success' ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                        {etlStatus.status === 'success' ? 'Healthy' : 'Failed'}
                      </span>
                    : <span style={{ color: '#b45309' }}>Never Run</span>}
                </div>
              </div>
            </div>

            <div className="etl-stat-card">
              <div className="etl-stat-icon" style={{ background: '#dbeafe' }}>
                <Database size={22} color="#1d4ed8" />
              </div>
              <div>
                <div className="etl-stat-label">Records Processed</div>
                <div className="etl-stat-value">{hasEtlData ? etlStatus.records_processed : '—'}</div>
              </div>
            </div>

            <div className="etl-stat-card">
              <div className="etl-stat-icon" style={{ background: '#ede9fe' }}>
                <Zap size={22} color="#6d28d9" />
              </div>
              <div>
                <div className="etl-stat-label">Last Duration</div>
                <div className="etl-stat-value">{hasEtlData ? `${etlStatus.duration_seconds}s` : '—'}</div>
              </div>
            </div>

            <div className="etl-stat-card">
              <div className="etl-stat-icon" style={{ background: '#fef3c7' }}>
                <Clock size={22} color="#b45309" />
              </div>
              <div>
                <div className="etl-stat-label">Last Run</div>
                <div className="etl-stat-value" style={{ fontSize: '13px' }}>
                  {hasEtlData ? new Date(etlStatus.run_at).toLocaleString() : 'Never'}
                </div>
              </div>
            </div>
          </div>

          {/* Run Panel */}
          <div className="chart-card">
            <h2><Play size={16} /> Run ETL Pipeline</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '13px', marginBottom: '20px', lineHeight: 1.7 }}>
              The ETL (Extract, Transform, Load) pipeline reads all complaint data, computes SLA breach
              status, resolution times, and agent performance metrics, then writes the results to the
              analytics table. Run this after significant data changes to keep reports up to date.
            </p>

            <div className="etl-run-row">
              <button className="btn btn-primary" onClick={runEtl} disabled={etlRunning} style={{ minWidth: 160 }}>
                {etlRunning
                  ? <><div className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} /> Running...</>
                  : <><Play size={15} /> Run ETL Now</>}
              </button>
              <span style={{ color: 'var(--gray-500)', fontSize: '13px' }}>
                {etlRunning ? 'Pipeline is running, please wait...' : 'This usually takes under 5 seconds.'}
              </span>
            </div>

            {hasEtlData && etlStatus.error_message && (
              <div className="alert alert-error" style={{ marginTop: 16 }}>
                <XCircle size={16} /> <strong>Last error:</strong> {etlStatus.error_message}
              </div>
            )}
          </div>

          {/* What ETL populates */}
          <div className="chart-card">
            <h2><BarChart2 size={16} /> What ETL Populates</h2>
            <div className="etl-info-grid">
              {[
                { label: 'SLA Analysis', desc: 'Breach counts and rates by category and priority' },
                { label: 'Resolution Trends', desc: 'Monthly avg resolution time and breach history' },
                { label: 'Agent Performance', desc: 'Per-agent resolution rate, avg time, and breaches' },
                { label: 'Analytics Table', desc: 'Flattened complaint snapshot with computed metrics' },
              ].map(({ label, desc }) => (
                <div key={label} className="etl-info-item">
                  <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{label}</div>
                    <div style={{ color: 'var(--gray-500)', fontSize: '12px', marginTop: 2 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
