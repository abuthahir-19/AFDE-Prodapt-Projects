import { useEffect, useState } from "react";
import {
  LayoutDashboard, Library, CheckCircle, BookMarked, Users,
  Clock, TrendingUp, AlertCircle, ArrowUpRight,
} from "lucide-react";
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

  if (loading) return (
    <div className="page-loading">
      <TrendingUp size={20} className="spin" />
      Loading dashboard…
    </div>
  );

  if (error) return (
    <div style={{ padding: "2rem" }}>
      <div className="alert alert-error"><AlertCircle size={16} />{error}</div>
    </div>
  );

  const cards = [
    { label: "Total Books", value: stats.total, icon: Library, gradient: "grad-blue", sub: "in collection" },
    { label: "Available", value: stats.available, icon: CheckCircle, gradient: "grad-green", sub: "ready to borrow" },
    { label: "Borrowed", value: stats.borrowed, icon: BookMarked, gradient: "grad-orange", sub: "currently out" },
    { label: "Borrowers", value: stats.borrowers, icon: Users, gradient: "grad-purple", sub: "registered" },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-icon">
          <LayoutDashboard size={22} />
        </div>
        <div>
          <h1>Dashboard</h1>
          <p>Library overview and recent activity</p>
        </div>
      </div>

      <div className="stat-grid">
        {cards.map(({ label, value, icon: Icon, gradient, sub }) => (
          <div key={label} className={`stat-card ${gradient}`}>
            <div className="stat-icon-wrap">
              <Icon size={24} strokeWidth={2} />
            </div>
            <div className="stat-body">
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
              <div className="stat-sub">{sub}</div>
            </div>
            <ArrowUpRight size={16} className="stat-arrow" />
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-header-icon"><Clock size={17} /></div>
          <h2>Recent Transactions</h2>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state">
            <Clock size={40} />
            <p>No transactions yet.</p>
          </div>
        ) : (
          <div className="table-wrapper">
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
                    <td><span className="tx-id">#{tx.transaction_id}</span></td>
                    <td>Book #{tx.book_id}</td>
                    <td>User #{tx.borrower_id}</td>
                    <td>{new Date(tx.borrow_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td>{tx.return_date ? new Date(tx.return_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : <span className="dash">—</span>}</td>
                    <td>
                      <span className={`badge ${tx.return_date ? "badge-success" : "badge-warning"}`}>
                        {tx.return_date ? <CheckCircle size={10} /> : <Clock size={10} />}
                        {tx.return_date ? "Returned" : "Active"}
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
