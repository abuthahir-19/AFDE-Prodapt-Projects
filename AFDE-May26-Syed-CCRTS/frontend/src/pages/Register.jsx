import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role_id: 4 })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/register', { ...form, role_id: Number(form.role_id) })
      setSuccess('Account created! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-logo">🎯</div>
          <h1>CCRS</h1>
          <p>Customer Complaint &amp; Resolution Tracking System</p>
        </div>

        <h2 className="auth-title">Create Account</h2>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name *</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="John Smith" />
          </div>
          <div className="form-group">
            <label>Email Address *</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1-555-0100" />
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} placeholder="At least 6 characters" />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
