import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createTicket } from '../services/ticketService';
import { PersonIcon, BuildingIcon, TagIcon, DescriptionIcon, PriorityIcon, AddIcon, BackIcon } from '../components/Icons';

const ISSUE_CATEGORIES = ['VPN Issue', 'Password Reset', 'Software Installation', 'Laptop Issue', 'Email Access', 'Network Connectivity', 'Hardware Request'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const PRIORITY_COLORS = {
  Low: '#16a34a', Medium: '#d97706', High: '#dc2626', Critical: '#7c3aed',
};

const FieldLabel = ({ icon, text, required }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '7px' }}>
    <span style={{ color: '#64748b' }}>{icon}</span>
    {text}
    {required && <span style={{ color: '#ef4444', marginLeft: '1px' }}>*</span>}
  </label>
);

const inputBase = {
  width: '100%',
  padding: '10px 13px',
  border: '1.5px solid #e2e8f0',
  borderRadius: '9px',
  fontSize: '14px',
  color: '#1e293b',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  fontFamily: 'inherit',
  backgroundColor: '#fff',
};

const CreateTicket = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ employee_name: '', department: '', issue_category: '', description: '', priority: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.employee_name.trim()) e.employee_name = 'Employee name is required.';
    if (!form.department.trim()) e.department = 'Department is required.';
    if (!form.issue_category) e.issue_category = 'Please select a category.';
    if (!form.description.trim()) e.description = 'Description is required.';
    if (!form.priority) e.priority = 'Please select a priority.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setServerError('');
    try {
      await createTicket(form);
      setSuccessMsg('Ticket created successfully! Redirecting…');
      setTimeout(() => navigate('/tickets'), 1400);
    } catch {
      setServerError('Failed to create ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const Field = ({ name, error, children }) => (
    <div style={{ marginBottom: '20px' }}>
      {children}
      {error && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>⚠ {error}</p>}
    </div>
  );

  const focusStyle = (name) => ({
    ...inputBase,
    borderColor: errors[name] ? '#ef4444' : '#e2e8f0',
  });

  return (
    <div style={{ padding: '28px 32px', maxWidth: '760px', margin: '0 auto' }}>

      {/* Back + Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link to="/tickets" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#1976d2', fontWeight: '500', marginBottom: '12px' }}>
          <BackIcon size={14} /> Back to Tickets
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '11px', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1976d2' }}>
            <AddIcon size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>Create New Ticket</h1>
            <p style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>Fill in the details to submit a new support request.</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ✅ {successMsg}
        </div>
      )}
      {serverError && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' }}>
          ⚠️ {serverError}
        </div>
      )}

      {/* Form Card */}
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
        <form onSubmit={handleSubmit}>

          {/* Row 1: Employee + Department */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <Field name="employee_name" error={errors.employee_name}>
              <FieldLabel icon={<PersonIcon size={14} />} text="Employee Name" required />
              <input
                type="text" name="employee_name" value={form.employee_name} onChange={handleChange}
                placeholder="Enter full name"
                style={focusStyle('employee_name')}
                onFocus={(e) => { e.target.style.borderColor = '#1976d2'; e.target.style.boxShadow = '0 0 0 3px rgba(25,118,210,0.12)'; }}
                onBlur={(e) => { e.target.style.borderColor = errors.employee_name ? '#ef4444' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
            </Field>
            <Field name="department" error={errors.department}>
              <FieldLabel icon={<BuildingIcon size={14} />} text="Department" required />
              <input
                type="text" name="department" value={form.department} onChange={handleChange}
                placeholder="e.g. IT, HR, Finance"
                style={focusStyle('department')}
                onFocus={(e) => { e.target.style.borderColor = '#1976d2'; e.target.style.boxShadow = '0 0 0 3px rgba(25,118,210,0.12)'; }}
                onBlur={(e) => { e.target.style.borderColor = errors.department ? '#ef4444' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
            </Field>
          </div>

          {/* Row 2: Category + Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <Field name="issue_category" error={errors.issue_category}>
              <FieldLabel icon={<TagIcon size={14} />} text="Issue Category" required />
              <select
                name="issue_category" value={form.issue_category} onChange={handleChange}
                style={{ ...focusStyle('issue_category'), cursor: 'pointer' }}
                onFocus={(e) => { e.target.style.borderColor = '#1976d2'; e.target.style.boxShadow = '0 0 0 3px rgba(25,118,210,0.12)'; }}
                onBlur={(e) => { e.target.style.borderColor = errors.issue_category ? '#ef4444' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              >
                <option value="">— Select Category —</option>
                {ISSUE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field name="priority" error={errors.priority}>
              <FieldLabel icon={<PriorityIcon size={14} />} text="Priority Level" required />
              <select
                name="priority" value={form.priority} onChange={handleChange}
                style={{ ...focusStyle('priority'), cursor: 'pointer', color: form.priority ? PRIORITY_COLORS[form.priority] : '#1e293b', fontWeight: form.priority ? '600' : '400' }}
                onFocus={(e) => { e.target.style.borderColor = '#1976d2'; e.target.style.boxShadow = '0 0 0 3px rgba(25,118,210,0.12)'; }}
                onBlur={(e) => { e.target.style.borderColor = errors.priority ? '#ef4444' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              >
                <option value="">— Select Priority —</option>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>

          {/* Description */}
          <Field name="description" error={errors.description}>
            <FieldLabel icon={<DescriptionIcon size={14} />} text="Description" required />
            <textarea
              name="description" value={form.description} onChange={handleChange}
              placeholder="Describe the issue in detail…"
              rows={4}
              style={{ ...focusStyle('description'), resize: 'vertical' }}
              onFocus={(e) => { e.target.style.borderColor = '#1976d2'; e.target.style.boxShadow = '0 0 0 3px rgba(25,118,210,0.12)'; }}
              onBlur={(e) => { e.target.style.borderColor = errors.description ? '#ef4444' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
            />
          </Field>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #f1f5f9', margin: '8px 0 24px' }} />

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                backgroundColor: submitting ? '#93c5fd' : '#1976d2',
                color: '#fff', padding: '11px 26px',
                border: 'none', borderRadius: '9px',
                fontSize: '14px', fontWeight: '700',
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: submitting ? 'none' : '0 2px 8px rgba(25,118,210,0.30)',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = '#1565c0'; }}
              onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = '#1976d2'; }}
            >
              {submitting ? '⏳ Submitting…' : <><AddIcon size={14} /> Submit Ticket</>}
            </button>
            <button
              type="button"
              onClick={() => navigate('/tickets')}
              style={{ backgroundColor: '#f8fafc', color: '#475569', padding: '11px 24px', border: '1.5px solid #e2e8f0', borderRadius: '9px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
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
