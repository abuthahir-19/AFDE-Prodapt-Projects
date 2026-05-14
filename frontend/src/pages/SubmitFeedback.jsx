import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { feedbackService } from '../services/feedbackService';
import './SubmitFeedback.css';

const RATING_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

const initialForm = { participant_name: '', program_name: '', rating: 0, comments: '' };

function SubmitFeedback() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.participant_name.trim()) e.participant_name = 'Name is required.';
    if (!form.program_name.trim()) e.program_name = 'Program / Event name is required.';
    if (!form.rating) e.rating = 'Please select a rating.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleRating = (val) => {
    setForm((prev) => ({ ...prev, rating: val }));
    setErrors((prev) => ({ ...prev, rating: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    try {
      await feedbackService.create({ ...form, rating: Number(form.rating) });
      setSuccess('Feedback submitted successfully!');
      setForm(initialForm);
      setTimeout(() => navigate('/feedback'), 1500);
    } catch (err) {
      setErrors({ submit: 'Failed to submit feedback. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="submit-page">
      <div className="form-card">
        <h1 className="form-title">Submit Feedback</h1>
        <p className="form-subtitle">Share your experience to help us improve.</p>

        {success && <div className="alert success">{success}</div>}
        {errors.submit && <div className="alert error">{errors.submit}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="participant_name">Participant Name <span className="required">*</span></label>
            <input
              id="participant_name"
              name="participant_name"
              type="text"
              placeholder="Enter your full name"
              value={form.participant_name}
              onChange={handleChange}
              className={errors.participant_name ? 'input-error' : ''}
            />
            {errors.participant_name && <span className="field-error">{errors.participant_name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="program_name">Training / Event / Product <span className="required">*</span></label>
            <input
              id="program_name"
              name="program_name"
              type="text"
              placeholder="e.g. React Workshop, Customer Service"
              value={form.program_name}
              onChange={handleChange}
              className={errors.program_name ? 'input-error' : ''}
            />
            {errors.program_name && <span className="field-error">{errors.program_name}</span>}
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
                  title={RATING_LABELS[star]}
                >
                  &#9733;
                </button>
              ))}
              {form.rating > 0 && (
                <span className="rating-label">{RATING_LABELS[form.rating]}</span>
              )}
            </div>
            {errors.rating && <span className="field-error">{errors.rating}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="comments">Comments</label>
            <textarea
              id="comments"
              name="comments"
              rows={4}
              placeholder="Share your thoughts, suggestions, or concerns..."
              value={form.comments}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SubmitFeedback;
