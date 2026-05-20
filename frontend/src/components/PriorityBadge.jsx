import React from 'react';

const priorityColors = {
  'Low': { background: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7' },
  'Medium': { background: '#fff3e0', color: '#e65100', border: '1px solid #ffcc80' },
  'High': { background: '#ffebee', color: '#c62828', border: '1px solid #ef9a9a' },
  'Critical': { background: '#f3e5f5', color: '#6a1b9a', border: '1px solid #ce93d8' },
};

const PriorityBadge = ({ priority }) => {
  const style = priorityColors[priority] || priorityColors['Low'];

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
      {priority}
    </span>
  );
};

export default PriorityBadge;
