import { useEffect, useState } from "react";
import { getBooks, getBorrowers, getTransactions, borrowBook, returnBook } from "../services/api";
import "./Form.css";

export default function BorrowReturn() {
  const [books, setBooks] = useState([]);
  const [borrowers, setBorrowers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [borrowForm, setBorrowForm] = useState({ book_id: "", borrower_id: "" });
  const [returnForm, setReturnForm] = useState({ transaction_id: "" });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const fetchAll = () =>
    Promise.all([getBooks(), getBorrowers(), getTransactions()])
      .then(([bRes, brRes, txRes]) => {
        setBooks(bRes.data);
        setBorrowers(brRes.data);
        setTransactions([...txRes.data].reverse());
        setFetchError("");
      })
      .catch(() => setFetchError("Could not connect to the backend. Please ensure the server is running on http://localhost:8000."))
      .finally(() => setLoading(false));

  useEffect(() => { fetchAll(); }, []);

  const notify = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const handleBorrow = async (e) => {
    e.preventDefault();
    if (!borrowForm.book_id || !borrowForm.borrower_id) {
      notify("Please select both a book and a borrower.", "error");
      return;
    }
    try {
      await borrowBook({ book_id: Number(borrowForm.book_id), borrower_id: Number(borrowForm.borrower_id) });
      notify("Book borrowed successfully!");
      setBorrowForm({ book_id: "", borrower_id: "" });
      fetchAll();
    } catch (err) {
      notify(err.response?.data?.detail || "Borrow failed.", "error");
    }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    if (!returnForm.transaction_id) {
      notify("Please select a transaction to return.", "error");
      return;
    }
    try {
      await returnBook({ transaction_id: Number(returnForm.transaction_id) });
      notify("Book returned successfully!");
      setReturnForm({ transaction_id: "" });
      fetchAll();
    } catch (err) {
      notify(err.response?.data?.detail || "Return failed.", "error");
    }
  };

  const availableBooks = books.filter((b) => b.availability_status === "available");
  const activeTransactions = transactions.filter((t) => !t.return_date);

  return (
    <div className="page">
      <h1>Borrow / Return</h1>

      {message.text && (
        <div className={`alert ${message.type === "error" ? "alert-error" : ""}`}>{message.text}</div>
      )}

      {fetchError && <div className="alert alert-error">{fetchError}</div>}

      <div className="two-col">
        <div className="card form-card">
          <h2>Borrow a Book</h2>
          <form onSubmit={handleBorrow} className="form-stack">
            <div className="field">
              <label>Select Book (Available)</label>
              <select value={borrowForm.book_id} onChange={(e) => setBorrowForm({ ...borrowForm, book_id: e.target.value })}>
                <option value="">-- Select a book --</option>
                {availableBooks.map((b) => (
                  <option key={b.book_id} value={b.book_id}>
                    [{b.book_id}] {b.title} — {b.author}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Select Borrower</label>
              <select value={borrowForm.borrower_id} onChange={(e) => setBorrowForm({ ...borrowForm, borrower_id: e.target.value })}>
                <option value="">-- Select a borrower --</option>
                {borrowers.map((b) => (
                  <option key={b.borrower_id} value={b.borrower_id}>
                    [{b.borrower_id}] {b.borrower_name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Borrow Book</button>
          </form>
        </div>

        <div className="card form-card">
          <h2>Return a Book</h2>
          <form onSubmit={handleReturn} className="form-stack">
            <div className="field">
              <label>Select Active Transaction</label>
              <select value={returnForm.transaction_id} onChange={(e) => setReturnForm({ transaction_id: e.target.value })}>
                <option value="">-- Select transaction --</option>
                {activeTransactions.map((t) => (
                  <option key={t.transaction_id} value={t.transaction_id}>
                    Tx #{t.transaction_id} — Book {t.book_id} / Borrower {t.borrower_id}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Return Book</button>
          </form>
        </div>
      </div>

      <div className="card">
        <h2>All Transactions</h2>
        {loading ? <p>Loading…</p> : fetchError ? null : transactions.length === 0 ? <p className="empty">No transactions yet.</p> : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tx ID</th><th>Book ID</th><th>Borrower ID</th>
                  <th>Borrow Date</th><th>Return Date</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.transaction_id}>
                    <td>{t.transaction_id}</td>
                    <td>{t.book_id}</td>
                    <td>{t.borrower_id}</td>
                    <td>{new Date(t.borrow_date).toLocaleDateString()}</td>
                    <td>{t.return_date ? new Date(t.return_date).toLocaleDateString() : "—"}</td>
                    <td>
                      <span className={`badge ${t.return_date ? "badge-success" : "badge-warning"}`}>
                        {t.return_date ? "Returned" : "Active"}
                      </span>
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
