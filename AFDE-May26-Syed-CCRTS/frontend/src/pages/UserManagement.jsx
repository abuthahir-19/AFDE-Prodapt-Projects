import React, { useState, useEffect } from 'react'
import Layout from '../components/common/Layout'
import api from '../services/api'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = () => {
    api.get('/users').then(r => setUsers(r.data)).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const toggleStatus = async (userId, current) => {
    setError(''); setSuccess('')
    try {
      await api.put(`/users/${userId}`, { is_active: !current })
      setSuccess(`User ${current ? 'deactivated' : 'activated'} successfully.`)
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Update failed.')
    }
  }

  const byRole = users.reduce((acc, u) => {
    acc[u.role_name] = (acc[u.role_name] || 0) + 1
    return acc
  }, {})

  return (
    <Layout>
      <div className="page-header">
        <h1>User Management</h1>
        <div className="role-summary">
          {Object.entries(byRole).map(([role, count]) => (
            <span key={role} className="badge badge-info">{role}: {count}</span>
          ))}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading ? <div className="loading">Loading users...</div> : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td className="text-muted">{u.phone || '—'}</td>
                  <td><span className="badge">{u.role_name}</span></td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => toggleStatus(u.id, u.is_active)}
                      className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-success'}`}
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}
