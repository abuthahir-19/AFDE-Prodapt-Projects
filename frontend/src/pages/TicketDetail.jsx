import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTicketById } from '../services/ticketService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

const DetailRow = ({ label, value, isText = false }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '180px 1fr',
      gap: '16px',
      padding: '14px 0',
      borderBottom: '1px solid #f0f0f0',
      alignItems: isText ? 'flex-start' : 'center',
    }}
  >
    <span style={{ fontSize: '13px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
      {label}
    </span>
    <span style={{ fontSize: '14px', color: '#333', lineHeight: '1.5' }}>{value}</span>
  </div>
);

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        const data = await getTicketById(id);
        setTicket(data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError(`Ticket #${id} not found.`);
        } else {
          setError('Failed to load ticket details.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: '#666' }}>Loading ticket details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
        <div
          style={{
            backgroundColor: '#ffebee',
            border: '1px solid #ef9a9a',
            color: '#c62828',
            padding: '16px',
            borderRadius: '6px',
            marginBottom: '16px',
          }}
        >
          {error}
        </div>
        <Link to="/tickets" style={{ color: '#1976d2', textDecoration: 'none', fontSize: '14px' }}>
          ← Back to Tickets
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '20px' }}>
        <Link to="/tickets" style={{ fontSize: '13px', color: '#1976d2', textDecoration: 'none' }}>
          ← Back to Tickets
        </Link>
      </div>

      {/* Title Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a' }}>
            Ticket #{ticket.ticket_id}
          </h1>
          <p style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>
            Submitted by {ticket.employee_name} — {ticket.department}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      {/* Details Card */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '8px 24px 24px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px',
        }}
      >
        <DetailRow label="Ticket ID" value={`#${ticket.ticket_id}`} />
        <DetailRow label="Employee Name" value={ticket.employee_name} />
        <DetailRow label="Department" value={ticket.department} />
        <DetailRow label="Issue Category" value={ticket.issue_category} />
        <DetailRow label="Priority" value={<PriorityBadge priority={ticket.priority} />} />
        <DetailRow label="Status" value={<StatusBadge status={ticket.status} />} />
        <DetailRow label="Created At" value={formatDate(ticket.created_at)} />
        <DetailRow
          label="Description"
          value={ticket.description}
          isText
        />
        {ticket.resolution_notes && (
          <DetailRow
            label="Resolution Notes"
            value={ticket.resolution_notes}
            isText
          />
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => navigate(`/tickets/${ticket.ticket_id}/edit`)}
          style={{
            backgroundColor: '#1976d2',
            color: '#fff',
            padding: '10px 24px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Edit Ticket
        </button>
        <button
          onClick={() => navigate('/tickets')}
          style={{
            backgroundColor: '#fff',
            color: '#666',
            padding: '10px 24px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default TicketDetail;
