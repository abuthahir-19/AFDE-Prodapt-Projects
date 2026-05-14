import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { feedbackService } from '../services/feedbackService';
import FeedbackCard from '../components/FeedbackCard';
import './Dashboard.css';

function StatCard({ label, value, color }) {
  return (
    <div className="stat-card" style={{ borderTop: `4px solid ${color}` }}>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function Dashboard() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    feedbackService.getAll()
      .then((res) => setFeedbackList(res.data))
      .catch(() => setError('Failed to load feedback. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  const totalCount = feedbackList.length;
  const avgRating =
    totalCount > 0
      ? (feedbackList.reduce((sum, f) => sum + f.rating, 0) / totalCount).toFixed(1)
      : '—';
  const recentFeedback = feedbackList.slice(0, 5);

  if (loading) return <div className="page-center">Loading dashboard...</div>;
  if (error) return <div className="page-center error-text">{error}</div>;

  return (
    <div className="dashboard-page">
      <h1 className="page-title">Dashboard</h1>

      <div className="stats-grid">
        <StatCard label="Total Feedback" value={totalCount} color="#2563eb" />
        <StatCard label="Average Rating" value={avgRating} color="#10b981" />
        <StatCard
          label="Excellent (5★)"
          value={feedbackList.filter((f) => f.rating === 5).length}
          color="#f59e0b"
        />
        <StatCard
          label="Needs Attention (≤2★)"
          value={feedbackList.filter((f) => f.rating <= 2).length}
          color="#ef4444"
        />
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Feedback</h2>
          <button className="btn-link" onClick={() => navigate('/feedback')}>
            View All →
          </button>
        </div>

        {recentFeedback.length === 0 ? (
          <div className="empty-state">
            <p>No feedback yet.</p>
            <button className="btn-primary" onClick={() => navigate('/submit')}>
              Submit First Feedback
            </button>
          </div>
        ) : (
          <div className="feedback-grid">
            {recentFeedback.map((f) => (
              <FeedbackCard key={f.feedback_id} feedback={f} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
