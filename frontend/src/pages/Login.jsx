import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Target, Mail, Lock, LogIn } from 'lucide-react'

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
          <div className="brand-logo-wrap">
            <Target size={30} color="#fff" />
          </div>
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
            {loading ? <><div className="spinner" style={{width:16,height:16,borderWidth:2}} /> Signing in...</> : <><LogIn size={15} /> Sign In</>}
          </button>
        </form>

        <p className="auth-footer">
          New customer? <Link to="/register">Create an account</Link>
        </p>

        <div className="demo-accounts">
          <p className="demo-title">Demo Accounts</p>
          <table>
            <tbody>
              {[
                { role: 'Admin',      email: 'admin@ccrs.com',      password: 'Admin@123' },
                { role: 'Supervisor', email: 'supervisor@ccrs.com', password: 'Supervisor@123' },
                { role: 'Agent',      email: 'agent@ccrs.com',      password: 'Agent@123' },
                { role: 'Customer',   email: 'customer@ccrs.com',   password: 'Customer@123' },
              ].map(({ role, email, password }) => (
                <tr key={role}>
                  <td>{role}</td>
                  <td>{email}</td>
                  <td>
                    <button
                      type="button"
                      className="demo-use-btn"
                      onClick={() => setForm({ email, password })}
                    >
                      Use
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
