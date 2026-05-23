import { useEffect, useState } from "react";
import {
  ArrowLeftRight, BookUp, BookDown, Clock, CheckCircle,
  AlertCircle, CheckCheck, List, RefreshCw,
} from "lucide-react";
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
      notify("Please select both a book and a borrower.", "error"); return;
    }
    try {
      await borrowBook({ book_id: Number(borrowForm.book_id), borrower_id: Number(borrowForm.borrower_id) });
      notify("Book borrowed successfully!");
      setBorrowForm({ book_id: "", borrower_id: "" });
      fetchAll();
    } catch (err) { notify(err.response?.data?.detail || "Borrow failed.", "error"); }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    if (!returnForm.transaction_id) {
      notify("Please select a transaction to return.", "error"); return;
    }
    try {
      await returnBook({ transaction_id: Number(returnForm.transaction_id) });
      notify("Book returned successfully!");
      setReturnForm({ transaction_id: "" });
      fetchAll();
    } catch (err) { notify(err.response?.data?.detail || "Return failed.", "error"); }
  };

  const availableBooks = books.filter((b) => b.availability_status === "available");
  const activeTransactions = transactions.filter((t) => !t.return_date);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-icon"><ArrowLeftRight size={22} /></div>
        <div>
          <h1>Borrow / Return</h1>
          <p>Issue books to borrowers and process returns</p>
        </div>
      </div>

      {message.text && (
        <div className={`alert ${message.type === "error" ? "alert-error" : ""}`}>
          {message.type === "error" ? <AlertCircle size={15} /> : <CheckCheck size={15} />}
          {message.text}
        </div>
      )}
      {fetchError && <div className="alert alert-error"><AlertCircle size={15} />{fetchError}</div>}

      <div className="two-col">
        {/* Borrow Panel */}
        <div className="card action-panel borrow-panel">
          <div className="card-header">
            <div className="card-header-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
              <BookUp size={16} />
            </div>
            <h2>Borrow a Book</h2>
          </div>
          <div className="panel-badge available-badge">
            <CheckCircle size={13} />{availableBooks.length} available
          </div>
          <form onSubmit={handleBorrow} className="form-stack">
            <div className="field">
              <label><BookUp size={12} />Select Book (Available only)</label>
              <select value={borrowForm.book_id} onChange={(e) => setBorrowForm({ ...borrowForm, book_id: e.target.value })}>
                <option value="">— Choose a book —</option>
                {availableBooks.map((b) => (
                  <option key={b.book_id} value={b.book_id}>
                    [{b.book_id}] {b.title} — {b.author}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label><CheckCircle size={12} />Select Borrower</label>
              <select value={borrowForm.borrower_id} onChange={(e) => setBorrowForm({ ...borrowForm, borrower_id: e.target.value })}>
                <option value="">— Choose a borrower —</option>
                {borrowers.map((b) => (
                  <option key={b.borrower_id} value={b.borrower_id}>
                    [{b.borrower_id}] {b.borrower_name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: "0.25rem" }}>
              <BookUp size={15} />Issue Book
            </button>
          </form>
        </div>

        {/* Return Panel */}
        <div className="card action-panel return-panel">
          <div className="card-header">
            <div className="card-header-icon" style={{ background: "#fff7ed", color: "#d97706" }}>
              <BookDown size={16} />
            </div>
            <h2>Return a Book</h2>
          </div>
          <div className="panel-badge active-badge">
            <Clock size={13} />{activeTransactions.length} active
          </div>
          <form onSubmit={handleReturn} className="form-stack">
            <div className="field">
              <label><Clock size={12} />Select Active Transaction</label>
              <select value={returnForm.transaction_id} onChange={(e) => setReturnForm({ transaction_id: e.target.value })}>
                <option value="">— Choose a transaction —</option>
                {activeTransactions.map((t) => (
                  <option key={t.transaction_id} value={t.transaction_id}>
                    Tx #{t.transaction_id} — Book {t.book_id} / Borrower {t.borrower_id}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-success" style={{ marginTop: "0.25rem" }}>
              <BookDown size={15} />Return Book
            </button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-header-icon"><List size={16} /></div>
          <h2>
            All Transactions
            <span className="count-chip">{transactions.length}</span>
          </h2>
          <button className="btn btn-sm btn-secondary" style={{ marginLeft: "auto" }} onClick={fetchAll}>
            <RefreshCw size={13} />Refresh
          </button>
        </div>
        {loading ? (
          <div className="empty-state"><Clock size={36} /><p>Loading transactions…</p></div>
        ) : fetchError ? null : transactions.length === 0 ? (
          <div className="empty-state"><ArrowLeftRight size={36} /><p>No transactions yet.</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tx ID</th><th>Book</th><th>Borrower</th>
                  <th>Borrow Date</th><th>Return Date</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.transaction_id}>
                    <td><span className="tx-id">#{t.transaction_id}</span></td>
                    <td>Book #{t.book_id}</td>
                    <td>User #{t.borrower_id}</td>
                    <td>{new Date(t.borrow_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td>{t.return_date ? new Date(t.return_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : <span className="dash">—</span>}</td>
                    <td>
                      <span className={`badge ${t.return_date ? "badge-success" : "badge-warning"}`}>
                        {t.return_date ? <CheckCircle size={10} /> : <Clock size={10} />}
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
