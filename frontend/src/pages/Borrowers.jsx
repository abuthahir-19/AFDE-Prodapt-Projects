import { useEffect, useState } from "react";
import { getBorrowers, createBorrower, updateBorrower, deleteBorrower } from "../services/api";
import "./Form.css";

const EMPTY_FORM = { borrower_name: "", email: "", phone: "" };

export default function Borrowers() {
  const [borrowers, setBorrowers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const fetchBorrowers = () =>
    getBorrowers()
      .then((r) => { setBorrowers(r.data); setFetchError(""); })
      .catch(() => setFetchError("Could not connect to the backend. Please ensure the server is running on http://localhost:8000."))
      .finally(() => setLoading(false));

  useEffect(() => { fetchBorrowers(); }, []);

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
      if (editId) {
        await updateBorrower(editId, form);
        setMessage("Borrower updated successfully.");
      } else {
        await createBorrower(form);
        setMessage("Borrower added successfully.");
      }
      setForm(EMPTY_FORM);
      setEditId(null);
      fetchBorrowers();
    } catch (err) {
      setMessage(err.response?.data?.detail || "An error occurred.");
    }
  };

  const handleEdit = (b) => {
    setEditId(b.borrower_id);
    setForm({ borrower_name: b.borrower_name, email: b.email, phone: b.phone });
    setErrors({});
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this borrower?")) return;
    try {
      await deleteBorrower(id);
      setMessage("Borrower deleted.");
      fetchBorrowers();
    } catch (err) {
      setMessage(err.response?.data?.detail || "Delete failed.");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="page">
      <h1>Borrower Management</h1>

      {message && <div className="alert">{message}</div>}

      <div className="card form-card">
        <h2>{editId ? "Edit Borrower" : "Add New Borrower"}</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="field">
            <label>Full Name *</label>
            <input name="borrower_name" value={form.borrower_name} onChange={handleChange} placeholder="Borrower name" />
            {errors.borrower_name && <span className="error">{errors.borrower_name}</span>}
          </div>
          <div className="field">
            <label>Email *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          <div className="field">
            <label>Phone *</label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Contact number" />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{editId ? "Update Borrower" : "Add Borrower"}</button>
            {editId && (
              <button type="button" className="btn btn-secondary" onClick={() => { setEditId(null); setForm(EMPTY_FORM); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>All Borrowers</h2>
        {loading ? <p>Loading…</p> : fetchError ? <p className="error">{fetchError}</p> : borrowers.length === 0 ? <p className="empty">No borrowers found.</p> : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {borrowers.map((b) => (
                  <tr key={b.borrower_id}>
                    <td>{b.borrower_id}</td>
                    <td>{b.borrower_name}</td>
                    <td>{b.email}</td>
                    <td>{b.phone}</td>
                    <td className="action-cell">
                      <button className="btn btn-sm btn-edit" onClick={() => handleEdit(b)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(b.borrower_id)}>Delete</button>
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
