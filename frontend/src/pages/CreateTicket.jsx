import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createTicket } from '../services/ticketService';

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

const CreateTicket = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    employee_name: '',
    department: '',
    issue_category: '',
    description: '',
    priority: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!form.employee_name.trim()) newErrors.employee_name = 'Employee name is required.';
    if (!form.department.trim()) newErrors.department = 'Department is required.';
    if (!form.issue_category) newErrors.issue_category = 'Please select an issue category.';
    if (!form.description.trim()) newErrors.description = 'Description is required.';
    if (!form.priority) newErrors.priority = 'Please select a priority.';
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
      await createTicket(form);
      setSuccessMsg('Ticket created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/tickets');
      }, 1500);
    } catch (err) {
      setServerError('Failed to create ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/tickets" style={{ fontSize: '13px', color: '#1976d2', textDecoration: 'none' }}>
          ← Back to Tickets
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', marginTop: '8px' }}>
          Create New Ticket
        </h1>
        <p style={{ color: '#666', marginTop: '4px', fontSize: '14px' }}>
          Fill in the details below to submit a new helpdesk ticket.
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
              placeholder="Enter employee name"
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
              placeholder="e.g. IT, HR, Finance"
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
              placeholder="Describe the issue in detail..."
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
          <div style={{ marginBottom: '28px' }}>
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

          {/* Submit Buttons */}
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
                transition: 'background-color 0.2s',
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
            <button
              type="button"
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
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;
