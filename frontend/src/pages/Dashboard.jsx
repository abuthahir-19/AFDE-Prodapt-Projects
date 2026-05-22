import { useEffect, useState } from "react";
import { getBooks, getTransactions, getBorrowers } from "../services/api";
import "./Dashboard.css";

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, available: 0, borrowed: 0, borrowers: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getBooks(), getTransactions(), getBorrowers()])
      .then(([booksRes, txRes, borrowersRes]) => {
        const books = booksRes.data;
        const transactions = txRes.data;
        setStats({
          total: books.length,
          available: books.filter((b) => b.availability_status === "available").length,
          borrowed: books.filter((b) => b.availability_status === "borrowed").length,
          borrowers: borrowersRes.data.length,
        });
        setRecent([...transactions].reverse().slice(0, 5));
      })
      .catch(() => setError("Could not connect to the backend. Please ensure the server is running on http://localhost:8000."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading dashboard…</div>;
  if (error) return <div className="page-loading" style={{ color: "#c62828" }}>{error}</div>;

  return (
    <div className="page dashboard">
      <h1>Dashboard</h1>

      <div className="stat-cards">
        <StatCard label="Total Books" value={stats.total} color="#1e3a5f" />
        <StatCard label="Available" value={stats.available} color="#2e7d32" />
        <StatCard label="Borrowed" value={stats.borrowed} color="#c62828" />
        <StatCard label="Borrowers" value={stats.borrowers} color="#6a1b9a" />
      </div>

      <section className="recent-section">
        <h2>Recent Transactions</h2>
        {recent.length === 0 ? (
          <p className="empty">No transactions yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Book ID</th>
                <th>Borrower ID</th>
                <th>Borrow Date</th>
                <th>Return Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((tx) => (
                <tr key={tx.transaction_id}>
                  <td>{tx.transaction_id}</td>
                  <td>{tx.book_id}</td>
                  <td>{tx.borrower_id}</td>
                  <td>{new Date(tx.borrow_date).toLocaleDateString()}</td>
                  <td>{tx.return_date ? new Date(tx.return_date).toLocaleDateString() : "—"}</td>
                  <td>
                    <span className={`badge ${tx.return_date ? "badge-success" : "badge-warning"}`}>
                      {tx.return_date ? "Returned" : "Active"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="stat-card" style={{ borderTop: `4px solid ${color}` }}>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
