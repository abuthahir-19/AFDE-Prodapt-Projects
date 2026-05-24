import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllTickets } from '../services/ticketService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { AddIcon, TicketsIcon, ClockIcon } from '../components/Icons';

const StatCard = ({ title, count, color, bgColor, icon }) => (
  <div
    style={{
      backgroundColor: '#fff',
      borderRadius: '14px',
      padding: '22px 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)',
      flex: '1',
      minWidth: '150px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      border: '1px solid #f1f5f9',
      transition: 'box-shadow 0.2s',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.10)')}
    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)')}
  >
    <div
      style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        backgroundColor: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        fontSize: '22px',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div>
      <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
        {title}
      </p>
      <p style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', lineHeight: '1' }}>{count}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await getAllTickets();
      setTickets(data);
    } catch {
      setError('Failed to load tickets. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'Open').length,
    inProgress: tickets.filter((t) => t.status === 'In Progress').length,
    resolved: tickets.filter((t) => t.status === 'Resolved').length,
    closed: tickets.filter((t) => t.status === 'Closed').length,
  };

  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTop: '3px solid #1976d2', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#64748b', fontSize: '14px' }}>Loading dashboard…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1251a3 0%, #1976d2 55%, #29b6f6 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 4px 24px rgba(25,118,210,0.28)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-30px', right: '120px', width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: '-20px', right: '60px', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)' }} />

        <div style={{ position: 'relative' }}>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', marginBottom: '6px', letterSpacing: '-0.2px' }}>
            Welcome to Helpdesk Dashboard 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '14px', fontWeight: '400' }}>
            Track, manage and resolve all your IT support tickets in one place.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', position: 'relative' }}>
          <Link
            to="/tickets/new"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              backgroundColor: '#fff', color: '#1565c0',
              padding: '9px 18px', borderRadius: '8px',
              fontWeight: '700', fontSize: '13px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            <AddIcon size={15} /> Create Ticket
          </Link>
          <Link
            to="/tickets"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff',
              padding: '9px 18px', borderRadius: '8px',
              fontWeight: '600', fontSize: '13px',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            <TicketsIcon size={15} /> View All
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '24px', fontSize: '14px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <StatCard title="Total Tickets"  count={stats.total}      color="#1976d2" bgColor="#dbeafe" icon="🎫" />
        <StatCard title="Open"           count={stats.open}       color="#2563eb" bgColor="#eff6ff" icon="📂" />
        <StatCard title="In Progress"    count={stats.inProgress} color="#d97706" bgColor="#fffbeb" icon="⚙️" />
        <StatCard title="Resolved"       count={stats.resolved}   color="#16a34a" bgColor="#f0fdf4" icon="✅" />
        <StatCard title="Closed"         count={stats.closed}     color="#475569" bgColor="#f8fafc" icon="🔒" />
      </div>

      {/* Recent Tickets */}
      <div style={{ backgroundColor: '#fff', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClockIcon size={16} style={{ color: '#64748b' }} />
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>Recent Tickets</h2>
            <span style={{ backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '10px' }}>
              Last 5
            </span>
          </div>
          <Link to="/tickets" style={{ fontSize: '13px', color: '#1976d2', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View all →
          </Link>
        </div>

        {recentTickets.length === 0 ? (
          <div style={{ padding: '52px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <p style={{ color: '#94a3b8', fontSize: '15px', fontWeight: '500', marginBottom: '16px' }}>No tickets yet</p>
            <Link
              to="/tickets/new"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#1976d2', color: '#fff', padding: '9px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}
            >
              <AddIcon size={14} /> Create your first ticket
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  {['ID', 'Employee', 'Category', 'Priority', 'Status', 'Created'].map((h) => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => (
                  <tr
                    key={ticket.ticket_id}
                    style={{ borderTop: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.12s' }}
                    onClick={() => navigate(`/tickets/${ticket.ticket_id}`)}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f9ff')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '13px 16px', fontSize: '13px', color: '#1976d2', fontWeight: '700' }}>
                      #{ticket.ticket_id}
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>
                      {ticket.employee_name}
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '13px', color: '#475569' }}>
                      {ticket.issue_category}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '12px', color: '#94a3b8' }}>
                      {formatDate(ticket.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
