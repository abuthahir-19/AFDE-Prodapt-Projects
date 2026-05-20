import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllTickets } from '../services/ticketService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

const StatCard = ({ title, count, color, icon }) => (
  <div
    style={{
      backgroundColor: '#fff',
      borderRadius: '8px',
      padding: '24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
      borderTop: `4px solid ${color}`,
      flex: '1',
      minWidth: '150px',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <p style={{ fontSize: '13px', color: '#888', fontWeight: '500', marginBottom: '8px' }}>
          {title}
        </p>
        <p style={{ fontSize: '32px', fontWeight: '700', color: '#1a1a1a' }}>{count}</p>
      </div>
      <span style={{ fontSize: '32px', opacity: 0.7 }}>{icon}</span>
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
    } catch (err) {
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
  };

  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: '#666', fontSize: '16px' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#1a1a1a' }}>Dashboard</h1>
        <p style={{ color: '#666', marginTop: '4px' }}>Welcome to the Helpdesk Ticket Management System</p>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: '#ffebee',
            border: '1px solid #ef9a9a',
            color: '#c62828',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '24px',
          }}
        >
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <StatCard title="Total Tickets" count={stats.total} color="#1976d2" icon="🎫" />
        <StatCard title="Open" count={stats.open} color="#2196f3" icon="📂" />
        <StatCard title="In Progress" count={stats.inProgress} color="#ff9800" icon="⚙️" />
        <StatCard title="Resolved" count={stats.resolved} color="#4caf50" icon="✅" />
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <Link
          to="/tickets/new"
          style={{
            backgroundColor: '#1976d2',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          + Create New Ticket
        </Link>
        <Link
          to="/tickets"
          style={{
            backgroundColor: '#fff',
            color: '#1976d2',
            padding: '10px 20px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px',
            border: '1px solid #1976d2',
          }}
        >
          View All Tickets
        </Link>
      </div>

      {/* Recent Tickets Table */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
            Recent Tickets
          </h2>
          <Link to="/tickets" style={{ fontSize: '13px', color: '#1976d2', textDecoration: 'none' }}>
            View all →
          </Link>
        </div>

        {recentTickets.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            <p style={{ fontSize: '15px' }}>No tickets yet.</p>
            <Link to="/tickets/new" style={{ color: '#1976d2', textDecoration: 'none', fontSize: '14px' }}>
              Create your first ticket
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  {['ID', 'Employee', 'Category', 'Priority', 'Status', 'Created At'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#666',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket, idx) => (
                  <tr
                    key={ticket.ticket_id}
                    style={{
                      borderTop: '1px solid #f0f0f0',
                      cursor: 'pointer',
                      backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa',
                    }}
                    onClick={() => navigate(`/tickets/${ticket.ticket_id}`)}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e3f2fd')}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#fff' : '#fafafa')
                    }
                  >
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#1976d2', fontWeight: '600' }}>
                      #{ticket.ticket_id}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#333' }}>
                      {ticket.employee_name}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#555' }}>
                      {ticket.issue_category}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#888' }}>
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
