import React from 'react';

const statusColors = {
  'Open': { background: '#e3f2fd', color: '#1565c0', border: '1px solid #90caf9' },
  'In Progress': { background: '#fff8e1', color: '#e65100', border: '1px solid #ffcc02' },
  'Resolved': { background: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7' },
  'Closed': { background: '#f5f5f5', color: '#616161', border: '1px solid #bdbdbd' },
};

const StatusBadge = ({ status }) => {
  const style = statusColors[status] || statusColors['Open'];

  return (
    <span
      style={{
        ...style,
        padding: '3px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block',
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
