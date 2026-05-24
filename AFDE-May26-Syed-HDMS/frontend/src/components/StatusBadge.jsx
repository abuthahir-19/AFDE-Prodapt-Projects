import React from 'react';

const STATUS_CONFIG = {
  'Open':        { bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6', border: '#bfdbfe' },
  'In Progress': { bg: '#fef3c7', color: '#b45309', dot: '#f59e0b', border: '#fde68a' },
  'Resolved':    { bg: '#dcfce7', color: '#15803d', dot: '#22c55e', border: '#bbf7d0' },
  'Closed':      { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8', border: '#e2e8f0' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Open'];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        padding: '3px 10px 3px 8px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        whiteSpace: 'nowrap',
        letterSpacing: '0.1px',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: cfg.dot,
          flexShrink: 0,
        }}
      />
      {status}
    </span>
  );
};

export default StatusBadge;
