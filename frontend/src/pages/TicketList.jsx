import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTickets, deleteTicket, searchTickets } from '../services/ticketService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

const CATEGORIES = [
  'VPN Issue',
  'Password Reset',
  'Software Installation',
  'Laptop Issue',
  'Email Access',
  'Network Connectivity',
  'Hardware Request',
];

const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const TicketList = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const hasFilters = keyword || filterCategory || filterStatus || filterPriority;
      let data;
      if (hasFilters) {
        data = await searchTickets({
          keyword,
          category: filterCategory,
          status: filterStatus,
          priority: filterPriority,
        });
      } else {
        data = await getAllTickets();
      }
      setTickets(data);
    } catch (err) {
      setError('Failed to load tickets. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [keyword, filterCategory, filterStatus, filterPriority]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchTickets]);

  const handleDelete = async (ticketId) => {
    try {
      await deleteTicket(ticketId);
      setTickets((prev) => prev.filter((t) => t.ticket_id !== ticketId));
      setDeleteConfirm(null);
    } catch (err) {
      setDeleteError('Failed to delete ticket.');
      setDeleteConfirm(null);
    }
  };

  const clearFilters = () => {
    setKeyword('');
    setFilterCategory('');
    setFilterStatus('');
    setFilterPriority('');
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const selectStyle = {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#333',
    backgroundColor: '#fff',
    cursor: 'pointer',
    outline: 'none',
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a' }}>All Tickets</h1>
          <p style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button
          onClick={() => navigate('/tickets/new')}
          style={{
            backgroundColor: '#1976d2',
            color: '#fff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          + Create Ticket
        </button>
      </div>

      {/* Filters */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '16px 20px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          placeholder="Search by name, department, description..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '13px',
            outline: 'none',
            flex: '1',
            minWidth: '220px',
          }}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={selectStyle}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={selectStyle}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          style={selectStyle}
        >
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {(keyword || filterCategory || filterStatus || filterPriority) && (
          <button
            onClick={clearFilters}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#666',
              backgroundColor: '#fff',
              cursor: 'pointer',
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Error */}
      {(error || deleteError) && (
        <div
          style={{
            backgroundColor: '#ffebee',
            border: '1px solid #ef9a9a',
            color: '#c62828',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '16px',
          }}
        >
          {error || deleteError}
        </div>
      )}

      {/* Tickets Table */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
            Loading tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#999' }}>
            <p style={{ fontSize: '15px', marginBottom: '12px' }}>No tickets found.</p>
            <button
              onClick={() => navigate('/tickets/new')}
              style={{
                backgroundColor: '#1976d2',
                color: '#fff',
                padding: '8px 20px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Create First Ticket
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  {['ID', 'Employee', 'Department', 'Category', 'Priority', 'Status', 'Created At', 'Actions'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '12px 14px',
                        textAlign: 'left',
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#666',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket, idx) => (
                  <tr
                    key={ticket.ticket_id}
                    style={{
                      borderTop: '1px solid #f0f0f0',
                      backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e3f2fd')}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#fff' : '#fafafa')
                    }
                  >
                    <td
                      style={{
                        padding: '12px 14px',
                        fontSize: '13px',
                        color: '#1976d2',
                        fontWeight: '600',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                      onClick={() => navigate(`/tickets/${ticket.ticket_id}`)}
                    >
                      #{ticket.ticket_id}
                    </td>
                    <td
                      style={{ padding: '12px 14px', fontSize: '13px', color: '#333', cursor: 'pointer' }}
                      onClick={() => navigate(`/tickets/${ticket.ticket_id}`)}
                    >
                      {ticket.employee_name}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '13px', color: '#555' }}>
                      {ticket.department}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '13px', color: '#555', whiteSpace: 'nowrap' }}>
                      {ticket.issue_category}
                    </td>
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '12px', color: '#888', whiteSpace: 'nowrap' }}>
                      {formatDate(ticket.created_at)}
                    </td>
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => navigate(`/tickets/${ticket.ticket_id}/edit`)}
                          style={{
                            padding: '5px 12px',
                            backgroundColor: '#e3f2fd',
                            color: '#1565c0',
                            border: '1px solid #90caf9',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '600',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(ticket.ticket_id)}
                          style={{
                            padding: '5px 12px',
                            backgroundColor: '#ffebee',
                            color: '#c62828',
                            border: '1px solid #ef9a9a',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '600',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '10px',
              padding: '32px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              maxWidth: '380px',
              width: '90%',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🗑️</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>
              Delete Ticket?
            </h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>
              Are you sure you want to delete ticket #{deleteConfirm}? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                style={{
                  backgroundColor: '#e53935',
                  color: '#fff',
                  padding: '10px 24px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
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
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketList;
