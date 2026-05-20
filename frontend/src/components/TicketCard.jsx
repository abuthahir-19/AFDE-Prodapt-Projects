import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

const TicketCard = ({ ticket }) => {
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      onClick={() => navigate(`/tickets/${ticket.ticket_id}`)}
      style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '16px 20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        borderLeft: '4px solid #1976d2',
        transition: 'box-shadow 0.2s, transform 0.1s',
        marginBottom: '12px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <span style={{ color: '#666', fontSize: '12px', fontWeight: '500' }}>
            #{ticket.ticket_id}
          </span>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginTop: '2px' }}>
            {ticket.employee_name}
          </h3>
          <p style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
            {ticket.department}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      <p style={{ fontSize: '13px', color: '#555', marginBottom: '10px', lineHeight: '1.4' }}>
        <strong>Category:</strong> {ticket.issue_category}
      </p>

      <p
        style={{
          fontSize: '13px',
          color: '#666',
          marginBottom: '10px',
          lineHeight: '1.4',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {ticket.description}
      </p>

      <p style={{ fontSize: '11px', color: '#999' }}>
        Created: {formatDate(ticket.created_at)}
      </p>
    </div>
  );
};

export default TicketCard;
