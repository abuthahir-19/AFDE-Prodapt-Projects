import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/common/Layout'
import { PriorityBadge } from '../components/common/StatusBadge'
import api from '../services/api'

export default function EscalationDashboard() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/complaints/escalated').then(r => setComplaints(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <div className="page-header">
        <h1>Escalation Dashboard</h1>
        <span className="badge badge-danger">{complaints.length} escalated</span>
      </div>

      {complaints.length > 0 && (
        <div className="alert alert-warning">
          ⚠️ These complaints have exceeded SLA deadlines and require immediate attention.
        </div>
      )}

      {loading ? <div className="loading">Loading...</div> : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Complaint #</th>
                <th>Title</th>
                <th>Customer</th>
                <th>Priority</th>
                <th>Escalation Level</th>
                <th>Assigned Agent</th>
                <th>SLA Deadline</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr><td colSpan={8} className="empty-state">✅ No escalated complaints</td></tr>
              ) : complaints.map(c => (
                <tr key={c.id}>
                  <td><code className="complaint-num">{c.complaint_number}</code></td>
                  <td>{c.title}</td>
                  <td>{c.customer_name}</td>
                  <td><PriorityBadge priority={c.priority} /></td>
                  <td><span className="badge badge-danger">Level {c.escalation_level}</span></td>
                  <td>{c.assigned_agent_name || <span className="text-danger">Unassigned</span>}</td>
                  <td className="text-danger">{c.sla_deadline ? new Date(c.sla_deadline).toLocaleString() : '—'}</td>
                  <td><Link to={`/complaints/${c.id}`} className="btn btn-sm btn-primary">Handle Now</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}
