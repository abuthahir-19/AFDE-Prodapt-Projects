import React from 'react'

const STATUS_STYLE = {
  'Open':                      { bg: '#dbeafe', color: '#1d4ed8' },
  'Assigned':                  { bg: '#ede9fe', color: '#6d28d9' },
  'In Progress':               { bg: '#fef3c7', color: '#b45309' },
  'Pending Customer Response': { bg: '#f1f5f9', color: '#475569' },
  'Escalated':                 { bg: '#fee2e2', color: '#b91c1c' },
  'Resolved':                  { bg: '#dcfce7', color: '#166534' },
  'Closed':                    { bg: '#f1f5f9', color: '#475569' },
}

const PRIORITY_STYLE = {
  'Low':      { bg: '#dcfce7', color: '#166534' },
  'Medium':   { bg: '#fef9c3', color: '#854d0e' },
  'High':     { bg: '#fee2e2', color: '#b91c1c' },
  'Critical': { bg: '#fce7f3', color: '#9d174d' },
}

export function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || { bg: '#f1f5f9', color: '#475569' }
  return (
    <span className="badge" style={{ backgroundColor: s.bg, color: s.color }}>
      {status}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  const s = PRIORITY_STYLE[priority] || { bg: '#f1f5f9', color: '#475569' }
  return (
    <span className="badge" style={{ backgroundColor: s.bg, color: s.color }}>
      {priority}
    </span>
  )
}
