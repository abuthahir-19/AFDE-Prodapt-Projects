import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/common/Layout'
import api from '../services/api'

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']
const SLA_MAP = { Low: '72 hours', Medium: '48 hours', High: '24 hours', Critical: '4 hours' }

export default function ComplaintRegistration() {
  const [form, setForm] = useState({ title: '', category_id: '', description: '', priority: 'Medium' })
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(console.error)
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/complaints', { ...form, category_id: parseInt(form.category_id) })
      navigate(`/complaints/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit complaint.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="page-header">
        <h1>Register New Complaint</h1>
      </div>

      <div className="form-card">
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Complaint Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
              placeholder="Brief summary of the issue"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} required>
                <option value="">Select a category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Priority *</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              required
              rows={6}
              placeholder="Describe your complaint in detail. Include relevant dates, order numbers, or reference IDs..."
            />
          </div>

          <div className="sla-info-box">
            <span className="sla-icon">⏱️</span>
            <span>SLA Resolution Deadline: <strong>{SLA_MAP[form.priority]}</strong> from submission</span>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
