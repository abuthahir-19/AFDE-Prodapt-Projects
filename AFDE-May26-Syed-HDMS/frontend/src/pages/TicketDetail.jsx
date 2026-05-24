import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTicketById } from '../services/ticketService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { PersonIcon, BuildingIcon, TagIcon, DescriptionIcon, PriorityIcon, StatusIcon, NoteIcon, ClockIcon, IdIcon, EditIcon, BackIcon } from '../components/Icons';

const DetailRow = ({ icon, label, value, isText = false }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '200px 1fr',
      gap: '16px',
      padding: '14px 0',
      borderBottom: '1px solid #f1f5f9',
      alignItems: isText ? 'flex-start' : 'center',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
      <span style={{ color: '#94a3b8' }}>{icon}</span>
      <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </span>
    </div>
    <span style={{ fontSize: '14px', color: '#1e293b', lineHeight: '1.6', fontWeight: '400' }}>{value}</span>
  </div>
);

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setTicket(await getTicketById(id));
      } catch (err) {
        setError(err.response?.status === 404 ? `Ticket #${id} not found.` : 'Failed to load ticket details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const formatDate = (d) =>
    new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTop: '3px solid #1976d2', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#64748b', fontSize: '14px' }}>Loading ticket details…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '32px', maxWidth: '820px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '16px', borderRadius: '10px', marginBottom: '16px' }}>
          {error}
        </div>
        <Link to="/tickets" style={{ color: '#1976d2', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <BackIcon size={14} /> Back to Tickets
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '820px', margin: '0 auto' }}>

      {/* Breadcrumb */}
      <Link to="/tickets" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#1976d2', fontWeight: '500', marginBottom: '18px' }}>
        <BackIcon size={14} /> Back to Tickets
      </Link>

      {/* Ticket header card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1251a3 0%, #1976d2 55%, #29b6f6 100%)',
          borderRadius: '14px',
          padding: '24px 28px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(25,118,210,0.22)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: '-20px', right: '80px', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'absolute', bottom: '-10px', right: '20px', width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', position: 'relative' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
              Support Ticket
            </p>
            <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: '800', marginBottom: '6px', letterSpacing: '-0.2px' }}>
              Ticket #{ticket.ticket_id}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '13px' }}>
              {ticket.issue_category} — submitted by <strong>{ticket.employee_name}</strong> ({ticket.department})
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>
      </div>

      {/* Details card */}
      <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '8px 28px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)', marginBottom: '20px', border: '1px solid #f1f5f9' }}>
        <DetailRow icon={<IdIcon size={14} />}          label="Ticket ID"       value={`#${ticket.ticket_id}`} />
        <DetailRow icon={<PersonIcon size={14} />}      label="Employee"        value={ticket.employee_name} />
        <DetailRow icon={<BuildingIcon size={14} />}    label="Department"      value={ticket.department} />
        <DetailRow icon={<TagIcon size={14} />}         label="Category"        value={ticket.issue_category} />
        <DetailRow icon={<PriorityIcon size={14} />}    label="Priority"        value={<PriorityBadge priority={ticket.priority} />} />
        <DetailRow icon={<StatusIcon size={14} />}      label="Status"          value={<StatusBadge status={ticket.status} />} />
        <DetailRow icon={<ClockIcon size={14} />}       label="Created At"      value={formatDate(ticket.created_at)} />
        <DetailRow icon={<DescriptionIcon size={14} />} label="Description"     value={ticket.description} isText />
        {ticket.resolution_notes && (
          <DetailRow icon={<NoteIcon size={14} />}      label="Resolution Notes" value={ticket.resolution_notes} isText />
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => navigate(`/tickets/${ticket.ticket_id}/edit`)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            backgroundColor: '#1976d2', color: '#fff',
            padding: '10px 22px', border: 'none', borderRadius: '9px',
            fontSize: '14px', fontWeight: '700', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(25,118,210,0.28)',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1565c0')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1976d2')}
        >
          <EditIcon size={14} /> Edit Ticket
        </button>
        <button
          onClick={() => navigate('/tickets')}
          style={{ backgroundColor: '#f8fafc', color: '#475569', padding: '10px 22px', border: '1.5px solid #e2e8f0', borderRadius: '9px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default TicketDetail;
