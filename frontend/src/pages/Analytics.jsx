import { useEffect, useState } from "react";
import {
  getMostBorrowedBooks,
  getCategoryStats,
  getMonthlyTrends,
  getOverdueTransactions,
} from "../services/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import "./Analytics.css";

const PIE_COLORS = [
  "#2d6aa0", "#c62828", "#2e7d32", "#6a1b9a",
  "#e65100", "#00838f", "#f9a825", "#37474f",
];

export default function Analytics() {
  const [mostBorrowed, setMostBorrowed] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [overdueList, setOverdueList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getMostBorrowedBooks(10),
      getCategoryStats(),
      getMonthlyTrends(),
      getOverdueTransactions(),
    ])
      .then(([mbRes, catRes, trendRes, overdueRes]) => {
        setMostBorrowed(mbRes.data);
        setCategoryStats(catRes.data);
        setMonthlyTrends(trendRes.data);
        setOverdueList(overdueRes.data);
      })
      .catch(() => setError("Failed to load analytics data. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="analytics-loading">Loading analytics...</div>;
  if (error) return <div className="analytics-error">{error}</div>;

  return (
    <div className="analytics-page">
      <h1 className="analytics-title">Analytics Dashboard</h1>

      {/* Row 1: Most Borrowed + Category Pie */}
      <div className="analytics-row">
        <div className="analytics-card">
          <h2>Top 10 Most Borrowed Books</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={mostBorrowed}
              margin={{ top: 5, right: 20, left: 0, bottom: 90 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="title"
                tick={{ fontSize: 11 }}
                angle={-40}
                textAnchor="end"
                interval={0}
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(value) => [value, "Borrows"]}
                labelFormatter={(label) => `Book: ${label}`}
              />
              <Bar
                dataKey="borrow_count"
                fill="#2d6aa0"
                name="Borrow Count"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-card">
          <h2>Borrowing by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryStats}
                dataKey="borrow_count"
                nameKey="category"
                cx="50%"
                cy="45%"
                outerRadius={95}
                label={({ category, percent }) =>
                  `${category} (${(percent * 100).toFixed(0)}%)`
                }
                labelLine={true}
              >
                {categoryStats.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, "Borrows"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Monthly Trends */}
      <div className="analytics-card analytics-card--full">
        <h2>Monthly Borrowing Trends</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={monthlyTrends}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip formatter={(value) => [value, "Borrows"]} />
            <Legend />
            <Line
              type="monotone"
              dataKey="borrow_count"
              stroke="#2d6aa0"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Monthly Borrows"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Row 3: Overdue Transactions */}
      <div className="analytics-card analytics-card--full">
        <h2>
          Overdue Transactions
          {overdueList.length > 0 && (
            <span className="overdue-badge">{overdueList.length}</span>
          )}
        </h2>
        {overdueList.length === 0 ? (
          <p className="analytics-empty">No overdue transactions.</p>
        ) : (
          <div className="table-wrapper">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Tx ID</th>
                  <th>Book Title</th>
                  <th>Borrower</th>
                  <th>Borrow Date</th>
                  <th>Due Date</th>
                  <th>Days Overdue</th>
                </tr>
              </thead>
              <tbody>
                {overdueList.map((tx) => (
                  <tr key={tx.transaction_id}>
                    <td>{tx.transaction_id}</td>
                    <td>{tx.title}</td>
                    <td>{tx.borrower_name}</td>
                    <td>{new Date(tx.borrow_date).toLocaleDateString()}</td>
                    <td>{new Date(tx.due_date).toLocaleDateString()}</td>
                    <td>
                      <span className="days-overdue-badge">{tx.days_overdue} days</span>
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
