import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/common/Layout'
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge'
import api from '../services/api'

const STATUSES = ['Open', 'Assigned', 'In Progress', 'Pending Customer Response', 'Escalated', 'Resolved', 'Closed']
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']

export default function ComplaintTracking() {
  const [complaints, setComplaints] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ status: '', priority: '' })
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, page_size: 20 })
      if (filters.status) params.append('status', filters.status)
      if (filters.priority) params.append('priority', filters.priority)
      const { data } = await api.get(`/complaints?${params}`)
      setComplaints(data.data)
      setTotal(data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [page, filters])

  const totalPages = Math.ceil(total / 20) || 1

  return (
    <Layout>
      <div className="page-header">
        <h1>Complaints</h1>
        <Link to="/complaints/new" className="btn btn-primary">+ New Complaint</Link>
      </div>

      <div className="filters-bar">
        <select value={filters.status} onChange={e => { setFilters({ ...filters, status: e.target.value }); setPage(1) }}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.priority} onChange={e => { setFilters({ ...filters, priority: e.target.value }); setPage(1) }}>
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <span className="total-count">{total} complaint{total !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="loading">Loading complaints...</div>
      ) : (
        <>
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Complaint #</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Agent</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 ? (
                  <tr><td colSpan={8} className="empty-state">No complaints found</td></tr>
                ) : complaints.map(c => (
                  <tr key={c.id}>
                    <td><code className="complaint-num">{c.complaint_number}</code></td>
                    <td className="complaint-title">{c.title}</td>
                    <td>{c.category_name}</td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>{c.assigned_agent_name || <span className="text-muted">Unassigned</span>}</td>
                    <td className="text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td><Link to={`/complaints/${c.id}`} className="btn btn-sm btn-outline">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn btn-sm">← Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="btn btn-sm">Next →</button>
          </div>
        </>
      )}
    </Layout>
  )
}
