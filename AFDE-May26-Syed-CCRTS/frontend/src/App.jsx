import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/common/PrivateRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ComplaintRegistration from './pages/ComplaintRegistration'
import ComplaintTracking from './pages/ComplaintTracking'
import ComplaintDetail from './pages/ComplaintDetail'
import AgentWorkQueue from './pages/AgentWorkQueue'
import EscalationDashboard from './pages/EscalationDashboard'
import Reports from './pages/Reports'
import UserManagement from './pages/UserManagement'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/complaints/new" element={<PrivateRoute><ComplaintRegistration /></PrivateRoute>} />
          <Route path="/complaints" element={<PrivateRoute><ComplaintTracking /></PrivateRoute>} />
          <Route path="/complaints/:id" element={<PrivateRoute><ComplaintDetail /></PrivateRoute>} />
          <Route path="/work-queue" element={<PrivateRoute roles={['Support Agent']}><AgentWorkQueue /></PrivateRoute>} />
          <Route path="/escalations" element={<PrivateRoute roles={['Admin', 'Supervisor']}><EscalationDashboard /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute roles={['Admin', 'Supervisor', 'Quality Team']}><Reports /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute roles={['Admin']}><UserManagement /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
