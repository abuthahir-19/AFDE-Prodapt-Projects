import { useEffect, useState } from "react";
import {
  Users, UserPlus, Pencil, Trash2, Save, X,
  Mail, Phone, Hash, AlertCircle, CheckCheck, List, User,
} from "lucide-react";
import { getBorrowers, createBorrower, updateBorrower, deleteBorrower } from "../services/api";
import "./Form.css";

const EMPTY_FORM = { borrower_name: "", email: "", phone: "" };

export default function Borrowers() {
  const [borrowers, setBorrowers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const fetchBorrowers = () =>
    getBorrowers()
      .then((r) => { setBorrowers(r.data); setFetchError(""); })
      .catch(() => setFetchError("Could not connect to the backend."))
      .finally(() => setLoading(false));

  useEffect(() => { fetchBorrowers(); }, []);

  const notify = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: "", type: "" }), 4000);
  };

  const validate = () => {
    const e = {};
    if (!form.borrower_name.trim()) e.borrower_name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone.trim()) e.phone = "Phone is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    try {
      if (editId) { await updateBorrower(editId, form); notify("Borrower updated successfully."); }
      else { await createBorrower(form); notify("Borrower added successfully."); }
      setForm(EMPTY_FORM); setEditId(null); fetchBorrowers();
    } catch (err) { notify(err.response?.data?.detail || "An error occurred.", "error"); }
  };

  const handleEdit = (b) => {
    setEditId(b.borrower_id);
    setForm({ borrower_name: b.borrower_name, email: b.email, phone: b.phone });
    setErrors({}); setToast({ text: "", type: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this borrower?")) return;
    try { await deleteBorrower(id); notify("Borrower deleted."); fetchBorrowers(); }
    catch (err) { notify(err.response?.data?.detail || "Delete failed.", "error"); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-icon"><Users size={22} /></div>
        <div>
          <h1>Borrower Management</h1>
          <p>Register and manage library members</p>
        </div>
      </div>

      {toast.text && (
        <div className={`alert ${toast.type === "error" ? "alert-error" : ""}`}>
          {toast.type === "error" ? <AlertCircle size={15} /> : <CheckCheck size={15} />}
          {toast.text}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="card-header-icon">
            {editId ? <Pencil size={16} /> : <UserPlus size={16} />}
          </div>
          <h2>{editId ? "Edit Borrower" : "Add New Borrower"}</h2>
        </div>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="field">
            <label><User size={12} />Full Name *</label>
            <input name="borrower_name" value={form.borrower_name} onChange={handleChange} placeholder="Enter full name" />
            {errors.borrower_name && <span className="field-error"><AlertCircle size={11} />{errors.borrower_name}</span>}
          </div>
          <div className="field">
            <label><Mail size={12} />Email Address *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />
            {errors.email && <span className="field-error"><AlertCircle size={11} />{errors.email}</span>}
          </div>
          <div className="field">
            <label><Phone size={12} />Phone Number *</label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Contact number" />
            {errors.phone && <span className="field-error"><AlertCircle size={11} />{errors.phone}</span>}
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editId ? <><Save size={15} />Update Borrower</> : <><UserPlus size={15} />Add Borrower</>}
            </button>
            {editId && (
              <button type="button" className="btn btn-secondary" onClick={() => { setEditId(null); setForm(EMPTY_FORM); setErrors({}); }}>
                <X size={15} />Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-header-icon"><List size={16} /></div>
          <h2>All Borrowers <span className="count-chip">{borrowers.length}</span></h2>
        </div>
        {loading ? (
          <div className="empty-state"><Users size={36} /><p>Loading borrowers…</p></div>
        ) : fetchError ? (
          <div className="alert alert-error"><AlertCircle size={15} />{fetchError}</div>
        ) : borrowers.length === 0 ? (
          <div className="empty-state"><Users size={36} /><p>No borrowers found. Register your first member above.</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th><Hash size={11} /> ID</th>
                  <th><User size={11} /> Name</th>
                  <th><Mail size={11} /> Email</th>
                  <th><Phone size={11} /> Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {borrowers.map((b) => (
                  <tr key={b.borrower_id}>
                    <td><span className="tx-id">#{b.borrower_id}</span></td>
                    <td>
                      <div className="borrower-name-cell">
                        <div className="avatar">{b.borrower_name.charAt(0).toUpperCase()}</div>
                        <span className="td-bold">{b.borrower_name}</span>
                      </div>
                    </td>
                    <td><a href={`mailto:${b.email}`} className="email-link">{b.email}</a></td>
                    <td>{b.phone}</td>
                    <td className="action-cell">
                      <button className="btn btn-sm btn-edit" onClick={() => handleEdit(b)}>
                        <Pencil size={12} />Edit
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(b.borrower_id)}>
                        <Trash2 size={12} />Delete
                      </button>
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
}
