import { useEffect, useState } from "react";
import {
  BookOpen, Plus, Pencil, Trash2, Save, X,
  Hash, User, Tag, Barcode, CheckCircle, BookMarked,
  AlertCircle, CheckCheck, List,
} from "lucide-react";
import { getBooks, createBook, updateBook, deleteBook } from "../services/api";
import "./Form.css";

const EMPTY_FORM = { title: "", author: "", category: "", isbn: "", availability_status: "available" };

export default function Books() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const fetchBooks = () =>
    getBooks()
      .then((r) => { setBooks(r.data); setFetchError(""); })
      .catch(() => setFetchError("Could not connect to the backend."))
      .finally(() => setLoading(false));

  useEffect(() => { fetchBooks(); }, []);

  const notify = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: "", type: "" }), 4000);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.author.trim()) e.author = "Author is required";
    if (!form.category.trim()) e.category = "Category is required";
    if (!form.isbn.trim()) e.isbn = "ISBN is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    try {
      if (editId) { await updateBook(editId, form); notify("Book updated successfully."); }
      else { await createBook(form); notify("Book added successfully."); }
      setForm(EMPTY_FORM); setEditId(null); fetchBooks();
    } catch (err) { notify(err.response?.data?.detail || "An error occurred.", "error"); }
  };

  const handleEdit = (book) => {
    setEditId(book.book_id);
    setForm({ title: book.title, author: book.author, category: book.category, isbn: book.isbn, availability_status: book.availability_status });
    setErrors({}); setToast({ text: "", type: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this book?")) return;
    try { await deleteBook(id); notify("Book deleted."); fetchBooks(); }
    catch (err) { notify(err.response?.data?.detail || "Delete failed.", "error"); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-icon"><BookOpen size={22} /></div>
        <div>
          <h1>Book Management</h1>
          <p>Add, edit, and manage your book collection</p>
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
            {editId ? <Pencil size={16} /> : <Plus size={16} />}
          </div>
          <h2>{editId ? "Edit Book" : "Add New Book"}</h2>
        </div>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="field">
            <label><BookOpen size={12} />Title *</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Enter book title" />
            {errors.title && <span className="field-error"><AlertCircle size={11} />{errors.title}</span>}
          </div>
          <div className="field">
            <label><User size={12} />Author *</label>
            <input name="author" value={form.author} onChange={handleChange} placeholder="Author name" />
            {errors.author && <span className="field-error"><AlertCircle size={11} />{errors.author}</span>}
          </div>
          <div className="field">
            <label><Tag size={12} />Category *</label>
            <input name="category" value={form.category} onChange={handleChange} placeholder="e.g. Fiction, Science" />
            {errors.category && <span className="field-error"><AlertCircle size={11} />{errors.category}</span>}
          </div>
          <div className="field">
            <label><Barcode size={12} />ISBN *</label>
            <input name="isbn" value={form.isbn} onChange={handleChange} placeholder="ISBN number" />
            {errors.isbn && <span className="field-error"><AlertCircle size={11} />{errors.isbn}</span>}
          </div>
          <div className="field">
            <label><CheckCircle size={12} />Availability Status</label>
            <select name="availability_status" value={form.availability_status} onChange={handleChange}>
              <option value="available">Available</option>
              <option value="borrowed">Borrowed</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editId ? <><Save size={15} />Update Book</> : <><Plus size={15} />Add Book</>}
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
          <h2>All Books <span className="count-chip">{books.length}</span></h2>
        </div>
        {loading ? (
          <div className="empty-state"><BookOpen size={36} /><p>Loading books…</p></div>
        ) : fetchError ? (
          <div className="alert alert-error"><AlertCircle size={15} />{fetchError}</div>
        ) : books.length === 0 ? (
          <div className="empty-state"><BookOpen size={36} /><p>No books found. Add your first book above.</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th><Hash size={11} /> ID</th>
                  <th><BookOpen size={11} /> Title</th>
                  <th><User size={11} /> Author</th>
                  <th><Tag size={11} /> Category</th>
                  <th><Barcode size={11} /> ISBN</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b.book_id}>
                    <td><span className="tx-id">#{b.book_id}</span></td>
                    <td className="td-bold">{b.title}</td>
                    <td>{b.author}</td>
                    <td><span className="badge badge-info">{b.category}</span></td>
                    <td><span className="isbn-chip">{b.isbn}</span></td>
                    <td>
                      <span className={`badge ${b.availability_status === "available" ? "badge-success" : "badge-warning"}`}>
                        {b.availability_status === "available" ? <CheckCircle size={10} /> : <BookMarked size={10} />}
                        {b.availability_status}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button className="btn btn-sm btn-edit" onClick={() => handleEdit(b)}>
                        <Pencil size={12} />Edit
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(b.book_id)}>
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
