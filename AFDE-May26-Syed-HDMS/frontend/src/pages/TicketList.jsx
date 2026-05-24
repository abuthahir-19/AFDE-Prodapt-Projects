import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTickets, deleteTicket, searchTickets } from '../services/ticketService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { AddIcon, SearchIcon, FilterIcon, EditIcon, DeleteIcon, ViewIcon } from '../components/Icons';

const CATEGORIES = ['VPN Issue', 'Password Reset', 'Software Installation', 'Laptop Issue', 'Email Access', 'Network Connectivity', 'Hardware Request'];
const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const selectStyle = {
  padding: '8px 12px',
  border: '1.5px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '13px',
  color: '#374151',
  backgroundColor: '#fff',
  cursor: 'pointer',
  outline: 'none',
  fontFamily: 'inherit',
  fontWeight: '500',
};

const ActionBtn = ({ onClick, color, bgColor, borderColor, hoverBg, icon, label }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '5px 10px',
        backgroundColor: hov ? hoverBg : bgColor,
        color,
        border: `1.5px solid ${borderColor}`,
        borderRadius: '7px',
        fontSize: '12px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.15s',
        fontFamily: 'inherit',
      }}
    >
      {icon}
      {label}
    </button>
  );
};

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
      const data = hasFilters
        ? await searchTickets({ keyword, category: filterCategory, status: filterStatus, priority: filterPriority })
        : await getAllTickets();
      setTickets(data);
    } catch {
      setError('Failed to load tickets. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [keyword, filterCategory, filterStatus, filterPriority]);

  useEffect(() => {
    const timer = setTimeout(fetchTickets, 300);
    return () => clearTimeout(timer);
  }, [fetchTickets]);

  const handleDelete = async (ticketId) => {
    try {
      await deleteTicket(ticketId);
      setTickets((prev) => prev.filter((t) => t.ticket_id !== ticketId));
      setDeleteConfirm(null);
    } catch {
      setDeleteError('Failed to delete ticket.');
      setDeleteConfirm(null);
    }
  };

  const clearFilters = () => {
    setKeyword(''); setFilterCategory(''); setFilterStatus(''); setFilterPriority('');
  };

  const hasFilters = keyword || filterCategory || filterStatus || filterPriority;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '3px' }}>All Tickets</h1>
          <p style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>
            {loading ? 'Loading…' : `${tickets.length} ticket${tickets.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <button
          onClick={() => navigate('/tickets/new')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            backgroundColor: '#1976d2', color: '#fff',
            padding: '9px 18px', border: 'none', borderRadius: '9px',
            fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(25,118,210,0.30)',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1565c0')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1976d2')}
        >
          <AddIcon size={14} /> Create Ticket
        </button>
      </div>

      {/* Search & Filters */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '16px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          marginBottom: '20px',
          border: '1px solid #f1f5f9',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <FilterIcon size={14} style={{ color: '#64748b' }} />
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Search & Filter</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search input with icon */}
          <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}>
              <SearchIcon size={15} />
            </div>
            <input
              type="text"
              placeholder="Search by name, department, description…"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px 8px 34px',
                border: '1.5px solid #e2e8f0', borderRadius: '8px',
                fontSize: '13px', outline: 'none', fontFamily: 'inherit',
                color: '#374151', fontWeight: '400',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#1976d2')}
              onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={selectStyle}>
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={selectStyle}>
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={selectStyle}>
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          {hasFilters && (
            <button
              onClick={clearFilters}
              style={{ padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#64748b', backgroundColor: '#f8fafc', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600' }}
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Errors */}
      {(error || deleteError) && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px' }}>
          ⚠️ {error || deleteError}
        </div>
      )}

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
        {loading ? (
          <div style={{ padding: '64px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
            ⏳ Loading tickets…
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: '64px', textAlign: 'center' }}>
            <div style={{ fontSize: '52px', marginBottom: '12px' }}>🔍</div>
            <p style={{ color: '#64748b', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>No tickets found</p>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>Try adjusting your filters or create a new ticket.</p>
            <button
              onClick={() => navigate('/tickets/new')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#1976d2', color: '#fff', padding: '9px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit' }}
            >
              <AddIcon size={14} /> Create Ticket
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  {['ID', 'Employee', 'Department', 'Category', 'Priority', 'Status', 'Created', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.ticket_id}
                    style={{ borderTop: '1px solid #f1f5f9', transition: 'background 0.12s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '13px 16px', fontSize: '13px', color: '#1976d2', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        onClick={() => navigate(`/tickets/${ticket.ticket_id}`)}>
                      #{ticket.ticket_id}
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '13px', color: '#1e293b', fontWeight: '500', cursor: 'pointer' }}
                        onClick={() => navigate(`/tickets/${ticket.ticket_id}`)}>
                      {ticket.employee_name}
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '13px', color: '#475569' }}>{ticket.department}</td>
                    <td style={{ padding: '13px 16px', fontSize: '13px', color: '#475569', whiteSpace: 'nowrap' }}>{ticket.issue_category}</td>
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}><PriorityBadge priority={ticket.priority} /></td>
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}><StatusBadge status={ticket.status} /></td>
                    <td style={{ padding: '13px 16px', fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{formatDate(ticket.created_at)}</td>
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <ActionBtn onClick={() => navigate(`/tickets/${ticket.ticket_id}`)}
                          color="#1d4ed8" bgColor="#eff6ff" borderColor="#bfdbfe" hoverBg="#dbeafe"
                          icon={<ViewIcon size={12} />} label="View" />
                        <ActionBtn onClick={() => navigate(`/tickets/${ticket.ticket_id}/edit`)}
                          color="#0369a1" bgColor="#f0f9ff" borderColor="#bae6fd" hoverBg="#e0f2fe"
                          icon={<EditIcon size={12} />} label="Edit" />
                        <ActionBtn onClick={() => setDeleteConfirm(ticket.ticket_id)}
                          color="#dc2626" bgColor="#fff5f5" borderColor="#fecaca" hoverBg="#fee2e2"
                          icon={<DeleteIcon size={12} />} label="Delete" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.45)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999, backdropFilter: 'blur(2px)' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '36px 32px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', maxWidth: '380px', width: '90%', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#dc2626' }}>
              <DeleteIcon size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>Delete Ticket?</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px', lineHeight: '1.6' }}>
              Are you sure you want to delete ticket <strong>#{deleteConfirm}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                style={{ backgroundColor: '#dc2626', color: '#fff', padding: '10px 24px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{ backgroundColor: '#f8fafc', color: '#475569', padding: '10px 24px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
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
