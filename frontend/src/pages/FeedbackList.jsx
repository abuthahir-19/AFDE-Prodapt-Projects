import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { feedbackService } from '../services/feedbackService';
import FeedbackCard from '../components/FeedbackCard';
import './FeedbackList.css';

function FeedbackList() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const navigate = useNavigate();

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const hasFilter = keyword || ratingFilter || programFilter;
      let res;
      if (hasFilter) {
        const params = {};
        if (keyword) params.keyword = keyword;
        if (ratingFilter) params.rating = ratingFilter;
        if (programFilter) params.program_name = programFilter;
        res = await feedbackService.search(params);
      } else {
        res = await feedbackService.getAll();
      }
      setFeedbackList(res.data);
    } catch {
      setError('Failed to load feedback.');
    } finally {
      setLoading(false);
    }
  }, [keyword, ratingFilter, programFilter]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const clearFilters = () => {
    setKeyword('');
    setRatingFilter('');
    setProgramFilter('');
  };

  const hasActiveFilters = keyword || ratingFilter || programFilter;

  return (
    <div className="list-page">
      <div className="list-header">
        <h1 className="page-title">All Feedback</h1>
        <button className="btn-primary" onClick={() => navigate('/submit')}>
          + Submit Feedback
        </button>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by keyword..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="filter-input"
        />
        <input
          type="text"
          placeholder="Filter by program / event..."
          value={programFilter}
          onChange={(e) => setProgramFilter(e.target.value)}
          className="filter-input"
        />
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Ratings</option>
          <option value="5">★★★★★ Excellent</option>
          <option value="4">★★★★☆ Very Good</option>
          <option value="3">★★★☆☆ Good</option>
          <option value="2">★★☆☆☆ Fair</option>
          <option value="1">★☆☆☆☆ Poor</option>
        </select>
        {hasActiveFilters && (
          <button className="btn-clear" onClick={clearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      {loading && <div className="list-status">Loading...</div>}
      {error && <div className="list-status error-text">{error}</div>}

      {!loading && !error && (
        <>
          <div className="results-count">
            {feedbackList.length} {feedbackList.length === 1 ? 'result' : 'results'}
            {hasActiveFilters ? ' found' : ' total'}
          </div>
          {feedbackList.length === 0 ? (
            <div className="empty-list">
              <p>No feedback found.</p>
              {hasActiveFilters && (
                <button className="btn-secondary" onClick={clearFilters}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="feedback-grid">
              {feedbackList.map((f) => (
                <FeedbackCard key={f.feedback_id} feedback={f} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FeedbackList;
