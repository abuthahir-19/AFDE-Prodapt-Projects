import { useEffect, useState } from "react";
import { getBooks, createBook, updateBook, deleteBook } from "../services/api";
import "./Form.css";

const EMPTY_FORM = { title: "", author: "", category: "", isbn: "", availability_status: "available" };

export default function Books() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const fetchBooks = () =>
    getBooks()
      .then((r) => { setBooks(r.data); setFetchError(""); })
      .catch(() => setFetchError("Could not connect to the backend. Please ensure the server is running on http://localhost:8000."))
      .finally(() => setLoading(false));

  useEffect(() => { fetchBooks(); }, []);

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
      if (editId) {
        await updateBook(editId, form);
        setMessage("Book updated successfully.");
      } else {
        await createBook(form);
        setMessage("Book added successfully.");
      }
      setForm(EMPTY_FORM);
      setEditId(null);
      fetchBooks();
    } catch (err) {
      setMessage(err.response?.data?.detail || "An error occurred.");
    }
  };

  const handleEdit = (book) => {
    setEditId(book.book_id);
    setForm({ title: book.title, author: book.author, category: book.category, isbn: book.isbn, availability_status: book.availability_status });
    setErrors({});
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this book?")) return;
    try {
      await deleteBook(id);
      setMessage("Book deleted.");
      fetchBooks();
    } catch (err) {
      setMessage(err.response?.data?.detail || "Delete failed.");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="page">
      <h1>Book Management</h1>

      {message && <div className="alert">{message}</div>}

      <div className="card form-card">
        <h2>{editId ? "Edit Book" : "Add New Book"}</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="field">
            <label>Title *</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Book title" />
            {errors.title && <span className="error">{errors.title}</span>}
          </div>
          <div className="field">
            <label>Author *</label>
            <input name="author" value={form.author} onChange={handleChange} placeholder="Author name" />
            {errors.author && <span className="error">{errors.author}</span>}
          </div>
          <div className="field">
            <label>Category *</label>
            <input name="category" value={form.category} onChange={handleChange} placeholder="e.g. Fiction" />
            {errors.category && <span className="error">{errors.category}</span>}
          </div>
          <div className="field">
            <label>ISBN *</label>
            <input name="isbn" value={form.isbn} onChange={handleChange} placeholder="ISBN number" />
            {errors.isbn && <span className="error">{errors.isbn}</span>}
          </div>
          <div className="field">
            <label>Availability Status</label>
            <select name="availability_status" value={form.availability_status} onChange={handleChange}>
              <option value="available">Available</option>
              <option value="borrowed">Borrowed</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{editId ? "Update Book" : "Add Book"}</button>
            {editId && (
              <button type="button" className="btn btn-secondary" onClick={() => { setEditId(null); setForm(EMPTY_FORM); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>All Books</h2>
        {loading ? <p>Loading…</p> : fetchError ? <p className="error">{fetchError}</p> : books.length === 0 ? <p className="empty">No books found.</p> : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th><th>Title</th><th>Author</th><th>Category</th><th>ISBN</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b.book_id}>
                    <td>{b.book_id}</td>
                    <td>{b.title}</td>
                    <td>{b.author}</td>
                    <td>{b.category}</td>
                    <td>{b.isbn}</td>
                    <td>
                      <span className={`badge ${b.availability_status === "available" ? "badge-success" : "badge-warning"}`}>
                        {b.availability_status}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button className="btn btn-sm btn-edit" onClick={() => handleEdit(b)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(b.book_id)}>Delete</button>
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
