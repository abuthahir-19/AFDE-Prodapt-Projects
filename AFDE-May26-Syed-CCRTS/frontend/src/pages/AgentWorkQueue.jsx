import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/common/Layout'
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge'
import api from '../services/api'

export default function AgentWorkQueue() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/complaints?page_size=50')
      .then(r => setComplaints(r.data.data.filter(c => !['Resolved', 'Closed'].includes(c.status))))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()

  return (
    <Layout>
      <div className="page-header">
        <h1>My Work Queue</h1>
        <span className="badge badge-info">{complaints.length} active</span>
      </div>

      {loading ? <div className="loading">Loading...</div> : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Complaint #</th>
                <th>Title</th>
                <th>Customer</th>
                <th>Priority</th>
                <th>Status</th>
                <th>SLA Deadline</th>
                <th>SLA Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr><td colSpan={8} className="empty-state">🎉 No active complaints in queue</td></tr>
              ) : complaints.map(c => {
                const breached = c.sla_deadline && new Date(c.sla_deadline) < now
                return (
                  <tr key={c.id} className={breached ? 'row-danger' : ''}>
                    <td><code className="complaint-num">{c.complaint_number}</code></td>
                    <td>{c.title}</td>
                    <td>{c.customer_name}</td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td className={breached ? 'text-danger' : ''}>{c.sla_deadline ? new Date(c.sla_deadline).toLocaleString() : '—'}</td>
                    <td>{breached ? <span className="badge badge-danger">Breached</span> : <span className="badge badge-success">On Track</span>}</td>
                    <td><Link to={`/complaints/${c.id}`} className="btn btn-sm btn-primary">Handle</Link></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}
