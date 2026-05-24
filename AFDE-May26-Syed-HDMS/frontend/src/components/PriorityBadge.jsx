import React from 'react';

const PRIORITY_CONFIG = {
  'Low':      { bg: '#f0fdf4', color: '#166534', dot: '#4ade80', border: '#bbf7d0', icon: '▸' },
  'Medium':   { bg: '#fffbeb', color: '#92400e', dot: '#fbbf24', border: '#fde68a', icon: '▸▸' },
  'High':     { bg: '#fff1f2', color: '#9f1239', dot: '#f87171', border: '#fecdd3', icon: '▲' },
  'Critical': { bg: '#fdf4ff', color: '#6b21a8', dot: '#c084fc', border: '#e9d5ff', icon: '⚑' },
};

const PriorityBadge = ({ priority }) => {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG['Low'];
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
      <span style={{ fontSize: '9px', flexShrink: 0, color: cfg.dot }}>{cfg.icon}</span>
      {priority}
    </span>
  );
};

export default PriorityBadge;
