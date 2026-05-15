import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/common/Layout'
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const ALL_STATUSES = ['Open', 'Assigned', 'In Progress', 'Pending Customer Response', 'Escalated', 'Resolved', 'Closed']

export default function ComplaintDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [complaint, setComplaint] = useState(null)
  const [agents, setAgents] = useState([])
  const [selectedAgent, setSelectedAgent] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [resolution, setResolution] = useState('')
  const [rating, setRating] = useState(5)
  const [fbComment, setFbComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = async () => {
    try {
      const { data } = await api.get(`/complaints/${id}`)
      setComplaint(data)
    } catch { navigate('/complaints') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    load()
    if (['Admin', 'Supervisor'].includes(user?.role)) {
      api.get('/users/agents').then(r => setAgents(r.data)).catch(() => {})
    }
  }, [id])

  const act = async (fn) => {
    setError(''); setSuccess(''); setBusy(true)
    try { await fn(); await load() } catch (e) { setError(e.response?.data?.detail || 'Action failed') }
    finally { setBusy(false) }
  }

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>
  if (!complaint) return null

  const role = user?.role
  const canAssign = ['Admin', 'Supervisor'].includes(role)
  const canStatus = ['Admin', 'Supervisor', 'Support Agent'].includes(role)
  const canResolve = ['Admin', 'Supervisor', 'Support Agent'].includes(role) && !['Resolved', 'Closed'].includes(complaint.status)
  const canClose = role === 'Customer' && complaint.status === 'Resolved'
  const canFeedback = role === 'Customer' && ['Resolved', 'Closed'].includes(complaint.status) && !complaint.has_feedback

  const slaBreached = complaint.sla_deadline && new Date(complaint.sla_deadline) < new Date() && !['Resolved', 'Closed'].includes(complaint.status)

  return (
    <Layout>
      <div className="page-header">
        <div>
          <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm back-btn">← Back</button>
          <h1>{complaint.title}</h1>
          <code className="complaint-num-lg">{complaint.complaint_number}</code>
        </div>
        <div className="header-badges">
          <PriorityBadge priority={complaint.priority} />
          <StatusBadge status={complaint.status} />
          {slaBreached && <span className="badge badge-danger">SLA Breached</span>}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="detail-grid">
        <div className="detail-main">
          <div className="card">
            <h3>Complaint Information</h3>
            <div className="info-grid">
              <div className="info-item"><span className="info-label">Customer</span><span>{complaint.customer_name} ({complaint.customer_email})</span></div>
              <div className="info-item"><span className="info-label">Category</span><span>{complaint.category_name}</span></div>
              <div className="info-item"><span className="info-label">Assigned Agent</span><span>{complaint.assigned_agent_name || '—'}</span></div>
              <div className="info-item"><span className="info-label">Escalation Level</span><span>{complaint.escalation_level > 0 ? `Level ${complaint.escalation_level}` : 'None'}</span></div>
              <div className="info-item"><span className="info-label">SLA Deadline</span><span className={slaBreached ? 'text-danger' : ''}>{complaint.sla_deadline ? new Date(complaint.sla_deadline).toLocaleString() : '—'}</span></div>
              <div className="info-item"><span className="info-label">Created</span><span>{new Date(complaint.created_at).toLocaleString()}</span></div>
              {complaint.resolved_date && <div className="info-item"><span className="info-label">Resolved</span><span>{new Date(complaint.resolved_date).toLocaleString()}</span></div>}
            </div>
          </div>

          <div className="card">
            <h3>Description</h3>
            <p className="description-text">{complaint.description}</p>
          </div>

          {complaint.attachments?.length > 0 && (
            <div className="card">
              <h3>Attachments ({complaint.attachments.length})</h3>
              <ul className="attachment-list">
                {complaint.attachments.map(a => (
                  <li key={a.id}>📎 {a.file_name} <span className="text-muted">· {new Date(a.uploaded_at).toLocaleDateString()}</span></li>
                ))}
              </ul>
            </div>
          )}

          <div className="card">
            <h3>Activity History</h3>
            <div className="timeline">
              {complaint.history?.map(h => (
                <div key={h.id} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <div className="timeline-status">
                      {h.old_status ? <><span className="old-status">{h.old_status}</span> → <span className="new-status">{h.new_status}</span></> : <span className="new-status">{h.new_status}</span>}
                    </div>
                    {h.comment && <div className="timeline-comment">"{h.comment}"</div>}
                    <div className="timeline-meta">{h.updated_by_name} · {new Date(h.updated_at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="detail-side">
          {canAssign && !['Closed'].includes(complaint.status) && (
            <div className="card action-card">
              <h3>Assign Complaint</h3>
              <select value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)}>
                <option value="">Select Agent</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <button onClick={() => act(() => api.put(`/complaints/${id}/assign`, { agent_id: parseInt(selectedAgent) }))} className="btn btn-primary btn-full mt-sm" disabled={busy || !selectedAgent}>
                Assign
              </button>
            </div>
          )}

          {canStatus && !['Resolved', 'Closed'].includes(complaint.status) && (
            <div className="card action-card">
              <h3>Update Status</h3>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                <option value="">Select Status</option>
                {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => act(() => api.put(`/complaints/${id}/status`, { status: newStatus }))} className="btn btn-warning btn-full mt-sm" disabled={busy || !newStatus}>
                Update
              </button>
            </div>
          )}

          {canResolve && (
            <div className="card action-card">
              <h3>Resolve Complaint</h3>
              <textarea value={resolution} onChange={e => setResolution(e.target.value)} rows={3} placeholder="Enter resolution details..." />
              <button onClick={() => act(() => api.put(`/complaints/${id}/resolve`, { resolution_comment: resolution }))} className="btn btn-success btn-full mt-sm" disabled={busy || !resolution.trim()}>
                Mark as Resolved
              </button>
            </div>
          )}

          {canClose && (
            <div className="card action-card">
              <h3>Close Complaint</h3>
              <p className="text-muted">Confirm the issue has been resolved to your satisfaction.</p>
              <button onClick={() => act(() => api.put(`/complaints/${id}/close`))} className="btn btn-primary btn-full" disabled={busy}>
                Confirm &amp; Close
              </button>
            </div>
          )}

          {canFeedback && (
            <div className="card action-card">
              <h3>Submit Feedback</h3>
              <div className="form-group">
                <label>Rating (1–5 stars)</label>
                <div className="star-rating">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" className={`star ${rating >= n ? 'active' : ''}`} onClick={() => setRating(n)}>★</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Comments</label>
                <textarea value={fbComment} onChange={e => setFbComment(e.target.value)} rows={3} placeholder="Share your experience..." />
              </div>
              <button onClick={() => act(() => api.post(`/feedback/${id}`, { rating, comments: fbComment }))} className="btn btn-primary btn-full" disabled={busy}>
                Submit Feedback
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
