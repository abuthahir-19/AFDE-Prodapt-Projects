import { useState } from "react";
import { searchBooks } from "../services/api";
import "./Form.css";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await searchBooks(query.trim());
      setResults(res.data);
      setSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Search Books</h1>

      <div className="card form-card">
        <form onSubmit={handleSearch} className="search-bar">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, author, or category…"
            className="search-input"
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </button>
        </form>
        <p className="search-hint">Enter a keyword to search across title, author, and category.</p>
      </div>

      {searched && (
        <div className="card">
          <h2>Results {results.length > 0 ? `(${results.length})` : ""}</h2>
          {results.length === 0 ? (
            <p className="empty">No books found for "{query}".</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>ID</th><th>Title</th><th>Author</th><th>Category</th><th>ISBN</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {results.map((b) => (
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
