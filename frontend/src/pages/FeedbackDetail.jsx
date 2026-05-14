import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { feedbackService } from '../services/feedbackService';
import './FeedbackDetail.css';

const RATING_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };
const RATING_COLORS = { 1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#22c55e', 5: '#10b981' };

function StarRating({ rating }) {
  return (
    <span className="star-rating-large">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= rating ? '#f59e0b' : '#d1d5db' }}>&#9733;</span>
      ))}
    </span>
  );
}

function FeedbackDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    feedbackService.getById(id)
      .then((res) => {
        setFeedback(res.data);
        setForm({
          participant_name: res.data.participant_name,
          program_name: res.data.program_name,
          rating: res.data.rating,
          comments: res.data.comments || '',
        });
      })
      .catch(() => setError('Feedback not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const validateForm = () => {
    const e = {};
    if (!form.participant_name?.trim()) e.participant_name = 'Name is required.';
    if (!form.program_name?.trim()) e.program_name = 'Program name is required.';
    if (!form.rating) e.rating = 'Rating is required.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleRating = (val) => {
    setForm((prev) => ({ ...prev, rating: val }));
    setFormErrors((prev) => ({ ...prev, rating: '' }));
  };

  const handleSave = async () => {
    const errs = validateForm();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setSaving(true);
    try {
      const res = await feedbackService.update(id, { ...form, rating: Number(form.rating) });
      setFeedback(res.data);
      setEditing(false);
    } catch {
      setFormErrors({ submit: 'Failed to update. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await feedbackService.delete(id);
      navigate('/feedback');
    } catch {
      setError('Failed to delete feedback.');
      setShowConfirm(false);
      setDeleting(false);
    }
  };

  if (loading) return <div className="detail-center">Loading...</div>;
  if (error) return <div className="detail-center error-text">{error}</div>;

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate('/feedback')}>
        ← Back to List
      </button>

      <div className="detail-card">
        {!editing ? (
          <>
            <div className="detail-header">
              <div>
                <h1 className="detail-name">{feedback.participant_name}</h1>
                <p className="detail-program">{feedback.program_name}</p>
              </div>
              <span
                className="rating-badge-large"
                style={{ backgroundColor: RATING_COLORS[feedback.rating] }}
              >
                {feedback.rating}/5 — {RATING_LABELS[feedback.rating]}
              </span>
            </div>

            <StarRating rating={feedback.rating} />

            <div className="detail-meta">
              <span>Submitted: {new Date(feedback.submitted_at).toLocaleString()}</span>
              <span>ID: #{feedback.feedback_id}</span>
            </div>

            {feedback.comments && (
              <div className="detail-comments">
                <h3>Comments</h3>
                <p>{feedback.comments}</p>
              </div>
            )}

            <div className="detail-actions">
              <button className="btn-edit" onClick={() => setEditing(true)}>
                Edit
              </button>
              <button className="btn-delete" onClick={() => setShowConfirm(true)}>
                Delete
              </button>
            </div>
          </>
        ) : (
          <div className="edit-form">
            <h2>Edit Feedback</h2>
            {formErrors.submit && <div className="alert error">{formErrors.submit}</div>}

            <div className="form-group">
              <label>Participant Name <span className="required">*</span></label>
              <input
                name="participant_name"
                value={form.participant_name}
                onChange={handleChange}
                className={formErrors.participant_name ? 'input-error' : ''}
              />
              {formErrors.participant_name && <span className="field-error">{formErrors.participant_name}</span>}
            </div>

            <div className="form-group">
              <label>Program / Event <span className="required">*</span></label>
              <input
                name="program_name"
                value={form.program_name}
                onChange={handleChange}
                className={formErrors.program_name ? 'input-error' : ''}
              />
              {formErrors.program_name && <span className="field-error">{formErrors.program_name}</span>}
            </div>

            <div className="form-group">
              <label>Rating <span className="required">*</span></label>
              <div className="star-selector">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${form.rating >= star ? 'selected' : ''}`}
                    onClick={() => handleRating(star)}
                  >
                    &#9733;
                  </button>
                ))}
                {form.rating > 0 && (
                  <span className="rating-label">{RATING_LABELS[form.rating]}</span>
                )}
              </div>
              {formErrors.rating && <span className="field-error">{formErrors.rating}</span>}
            </div>

            <div className="form-group">
              <label>Comments</label>
              <textarea
                name="comments"
                rows={4}
                value={form.comments}
                onChange={handleChange}
              />
            </div>

            <div className="detail-actions">
              <button className="btn-secondary" onClick={() => setEditing(false)} disabled={saving}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Feedback</h3>
            <p>Are you sure you want to delete this feedback? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowConfirm(false)} disabled={deleting}>
                Cancel
              </button>
              <button className="btn-delete" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedbackDetail;
