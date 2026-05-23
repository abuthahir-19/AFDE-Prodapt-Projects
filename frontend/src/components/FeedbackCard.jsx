import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, BookOpen, Calendar } from 'lucide-react';
import './FeedbackCard.css';

const RATING_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };
const RATING_COLORS = { 1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#22c55e', 5: '#10b981' };

function StarRating({ rating }) {
  return (
    <span className="star-rating">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= rating ? '#f59e0b' : '#d1d5db' }}>&#9733;</span>
      ))}
    </span>
  );
}

function FeedbackCard({ feedback }) {
  const navigate = useNavigate();

  return (
    <div className="feedback-card" onClick={() => navigate(`/feedback/${feedback.feedback_id}`)}>
      <div className="card-header">
        <span className="participant-name">
          <User size={14} className="card-icon" />
          {feedback.participant_name}
        </span>
        <span
          className="rating-badge"
          style={{ backgroundColor: RATING_COLORS[feedback.rating] }}
        >
          {feedback.rating}/5 — {RATING_LABELS[feedback.rating]}
        </span>
      </div>
      <div className="card-program">
        <BookOpen size={13} className="card-icon" />
        {feedback.program_name}
      </div>
      <StarRating rating={feedback.rating} />
      {feedback.comments && (
        <p className="card-comments">{feedback.comments}</p>
      )}
      <div className="card-date">
        <Calendar size={12} className="card-icon" />
        {new Date(feedback.submitted_at).toLocaleString()}
      </div>
    </div>
  );
}

export default FeedbackCard;
