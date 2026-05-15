import React from 'react'

const STATUS_COLOR = {
  'Open': '#3b82f6',
  'Assigned': '#8b5cf6',
  'In Progress': '#f59e0b',
  'Pending Customer Response': '#6b7280',
  'Escalated': '#ef4444',
  'Resolved': '#10b981',
  'Closed': '#374151',
}

const PRIORITY_COLOR = {
  'Low': '#10b981',
  'Medium': '#f59e0b',
  'High': '#ef4444',
  'Critical': '#7f1d1d',
}

export function StatusBadge({ status }) {
  return (
    <span className="badge" style={{ backgroundColor: STATUS_COLOR[status] || '#6b7280', color: '#fff' }}>
      {status}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  return (
    <span className="badge" style={{ backgroundColor: PRIORITY_COLOR[priority] || '#6b7280', color: '#fff' }}>
      {priority}
    </span>
  )
}
