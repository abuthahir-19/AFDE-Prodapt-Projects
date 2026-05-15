import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.user, data.access_token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.')
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

        <h2 className="auth-title">Sign In</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          New customer? <Link to="/register">Create an account</Link>
        </p>

        <div className="demo-accounts">
          <p className="demo-title">Demo Accounts</p>
          <table>
            <tbody>
              <tr><td>Admin</td><td>admin@ccrs.com</td><td>Admin@123</td></tr>
              <tr><td>Supervisor</td><td>supervisor@ccrs.com</td><td>Supervisor@123</td></tr>
              <tr><td>Agent</td><td>agent@ccrs.com</td><td>Agent@123</td></tr>
              <tr><td>Customer</td><td>customer@ccrs.com</td><td>Customer@123</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
