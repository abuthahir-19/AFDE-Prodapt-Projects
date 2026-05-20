import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTicketById, updateTicket } from '../services/ticketService';

const ISSUE_CATEGORIES = [
  'VPN Issue',
  'Password Reset',
  'Software Installation',
  'Laptop Issue',
  'Email Access',
  'Network Connectivity',
  'Hardware Request',
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '14px',
  color: '#333',
  outline: 'none',
  transition: 'border-color 0.2s',
};

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '600',
  color: '#444',
  marginBottom: '6px',
};

const EditTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    employee_name: '',
    department: '',
    issue_category: '',
    description: '',
    priority: '',
    status: '',
    resolution_notes: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const data = await getTicketById(id);
        setForm({
          employee_name: data.employee_name || '',
          department: data.department || '',
          issue_category: data.issue_category || '',
          description: data.description || '',
          priority: data.priority || '',
          status: data.status || '',
          resolution_notes: data.resolution_notes || '',
        });
      } catch (err) {
        setFetchError(
          err.response?.status === 404
            ? `Ticket #${id} not found.`
            : 'Failed to load ticket data.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  const validate = () => {
    const newErrors = {};
    if (!form.employee_name.trim()) newErrors.employee_name = 'Employee name is required.';
    if (!form.department.trim()) newErrors.department = 'Department is required.';
    if (!form.issue_category) newErrors.issue_category = 'Please select an issue category.';
    if (!form.description.trim()) newErrors.description = 'Description is required.';
    if (!form.priority) newErrors.priority = 'Please select a priority.';
    if (!form.status) newErrors.status = 'Please select a status.';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      const payload = {
        ...form,
        resolution_notes: form.resolution_notes || null,
      };
      await updateTicket(id, payload);
      setSuccessMsg('Ticket updated successfully! Redirecting...');
      setTimeout(() => {
        navigate(`/tickets/${id}`);
      }, 1500);
    } catch (err) {
      setServerError('Failed to update ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: '#666' }}>Loading ticket...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div style={{ padding: '32px', maxWidth: '700px', margin: '0 auto' }}>
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
          {fetchError}
        </div>
        <Link to="/tickets" style={{ color: '#1976d2', textDecoration: 'none', fontSize: '14px' }}>
          ← Back to Tickets
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link
          to={`/tickets/${id}`}
          style={{ fontSize: '13px', color: '#1976d2', textDecoration: 'none' }}
        >
          ← Back to Ticket #{id}
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', marginTop: '8px' }}>
          Edit Ticket #{id}
        </h1>
        <p style={{ color: '#666', marginTop: '4px', fontSize: '14px' }}>
          Update the ticket information below.
        </p>
      </div>

      {successMsg && (
        <div
          style={{
            backgroundColor: '#e8f5e9',
            border: '1px solid #a5d6a7',
            color: '#2e7d32',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontWeight: '500',
          }}
        >
          {successMsg}
        </div>
      )}

      {serverError && (
        <div
          style={{
            backgroundColor: '#ffebee',
            border: '1px solid #ef9a9a',
            color: '#c62828',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '20px',
          }}
        >
          {serverError}
        </div>
      )}

      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '32px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* Employee Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>
              Employee Name <span style={{ color: '#e53935' }}>*</span>
            </label>
            <input
              type="text"
              name="employee_name"
              value={form.employee_name}
              onChange={handleChange}
              style={{
                ...inputStyle,
                borderColor: errors.employee_name ? '#e53935' : '#ddd',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#1976d2')}
              onBlur={(e) =>
                (e.target.style.borderColor = errors.employee_name ? '#e53935' : '#ddd')
              }
            />
            {errors.employee_name && (
              <p style={{ color: '#e53935', fontSize: '12px', marginTop: '4px' }}>
                {errors.employee_name}
              </p>
            )}
          </div>

          {/* Department */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>
              Department <span style={{ color: '#e53935' }}>*</span>
            </label>
            <input
              type="text"
              name="department"
              value={form.department}
              onChange={handleChange}
              style={{
                ...inputStyle,
                borderColor: errors.department ? '#e53935' : '#ddd',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#1976d2')}
              onBlur={(e) =>
                (e.target.style.borderColor = errors.department ? '#e53935' : '#ddd')
              }
            />
            {errors.department && (
              <p style={{ color: '#e53935', fontSize: '12px', marginTop: '4px' }}>
                {errors.department}
              </p>
            )}
          </div>

          {/* Issue Category */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>
              Issue Category <span style={{ color: '#e53935' }}>*</span>
            </label>
            <select
              name="issue_category"
              value={form.issue_category}
              onChange={handleChange}
              style={{
                ...inputStyle,
                borderColor: errors.issue_category ? '#e53935' : '#ddd',
                backgroundColor: '#fff',
                cursor: 'pointer',
              }}
            >
              <option value="">-- Select Category --</option>
              {ISSUE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.issue_category && (
              <p style={{ color: '#e53935', fontSize: '12px', marginTop: '4px' }}>
                {errors.issue_category}
              </p>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>
              Description <span style={{ color: '#e53935' }}>*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              style={{
                ...inputStyle,
                borderColor: errors.description ? '#e53935' : '#ddd',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#1976d2')}
              onBlur={(e) =>
                (e.target.style.borderColor = errors.description ? '#e53935' : '#ddd')
              }
            />
            {errors.description && (
              <p style={{ color: '#e53935', fontSize: '12px', marginTop: '4px' }}>
                {errors.description}
              </p>
            )}
          </div>

          {/* Priority */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>
              Priority <span style={{ color: '#e53935' }}>*</span>
            </label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              style={{
                ...inputStyle,
                borderColor: errors.priority ? '#e53935' : '#ddd',
                backgroundColor: '#fff',
                cursor: 'pointer',
              }}
            >
              <option value="">-- Select Priority --</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {errors.priority && (
              <p style={{ color: '#e53935', fontSize: '12px', marginTop: '4px' }}>
                {errors.priority}
              </p>
            )}
          </div>

          {/* Status */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>
              Status <span style={{ color: '#e53935' }}>*</span>
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              style={{
                ...inputStyle,
                borderColor: errors.status ? '#e53935' : '#ddd',
                backgroundColor: '#fff',
                cursor: 'pointer',
              }}
            >
              <option value="">-- Select Status --</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.status && (
              <p style={{ color: '#e53935', fontSize: '12px', marginTop: '4px' }}>
                {errors.status}
              </p>
            )}
          </div>

          {/* Resolution Notes */}
          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Resolution Notes</label>
            <textarea
              name="resolution_notes"
              value={form.resolution_notes}
              onChange={handleChange}
              rows={3}
              placeholder="Add resolution notes (optional)..."
              style={{
                ...inputStyle,
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#1976d2')}
              onBlur={(e) => (e.target.style.borderColor = '#ddd')}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: submitting ? '#90caf9' : '#1976d2',
                color: '#fff',
                padding: '10px 24px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/tickets/${id}`)}
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
        </form>
      </div>
    </div>
  );
};

export default EditTicket;
