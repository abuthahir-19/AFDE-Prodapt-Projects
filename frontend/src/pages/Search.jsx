import { useState } from "react";
import {
  Search as SearchIcon, BookOpen, User, Tag, Barcode,
  CheckCircle, BookMarked, Info, X,
} from "lucide-react";
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

  const handleClear = () => { setQuery(""); setResults([]); setSearched(false); };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-icon"><SearchIcon size={22} /></div>
        <div>
          <h1>Search Books</h1>
          <p>Find books by title, author, or category</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSearch} className="search-bar">
          <div className="search-input-wrap">
            <SearchIcon size={16} className="search-input-icon" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, or category…"
              className="search-input"
            />
            {query && (
              <button type="button" className="search-clear-btn" onClick={handleClear}>
                <X size={14} />
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading || !query.trim()}>
            <SearchIcon size={15} />
            {loading ? "Searching…" : "Search"}
          </button>
        </form>
        <p className="search-hint">
          <Info size={12} />
          Searches across book title, author name, and category simultaneously.
        </p>
      </div>

      {searched && (
        <div className="card">
          <div className="card-header">
            <div className="card-header-icon"><BookOpen size={16} /></div>
            <h2>
              {results.length > 0
                ? <>Results for "<em>{query}</em>" <span className="count-chip">{results.length}</span></>
                : `No results for "${query}"`}
            </h2>
          </div>
          {results.length === 0 ? (
            <div className="empty-state">
              <SearchIcon size={40} />
              <p>No books match your search. Try a different keyword.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th><BookOpen size={11} /> Title</th>
                    <th><User size={11} /> Author</th>
                    <th><Tag size={11} /> Category</th>
                    <th><Barcode size={11} /> ISBN</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((b) => (
                    <tr key={b.book_id}>
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
