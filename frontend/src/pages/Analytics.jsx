import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Download, MessageSquare, Star, BookOpen, Trophy, BarChart2 } from 'lucide-react';
import { analyticsService } from '../services/feedbackService';
import './Analytics.css';

const RATING_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#6366f1'];
const RATING_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

function StarDisplay({ value }) {
  return (
    <span className="star-display">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(value) ? 'star-filled' : 'star-empty'}>
          &#9733;
        </span>
      ))}
    </span>
  );
}

function Analytics() {
  const [summary, setSummary] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, programsRes] = await Promise.all([
        analyticsService.getSummary(),
        analyticsService.getPrograms(),
      ]);
      setSummary(summaryRes.data);
      setPrograms(programsRes.data);
    } catch {
      setError('Failed to load analytics. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await analyticsService.downloadReport();
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ts = new Date().toISOString().slice(0, 10);
      a.download = `feedback_report_${ts}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">Loading analytics…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-error">{error}</div>
      </div>
    );
  }

  const ratingChartData = summary?.rating_distribution?.map((d) => ({
    name: `${d.rating}★`,
    count: d.count,
    rating: d.rating,
  })) || [];

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p>Aggregated insights from all imported and submitted feedback.</p>
        </div>
        <button
          className="download-btn"
          onClick={handleDownload}
          disabled={downloading || !summary?.total_feedback}
        >
          <Download size={16} /> {downloading ? 'Downloading…' : 'Download Report'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon summary-icon--blue"><MessageSquare size={22} /></div>
          <div className="summary-value">{summary?.total_feedback ?? 0}</div>
          <div className="summary-label">Total Feedback</div>
        </div>
        <div className="summary-card summary-card--indigo">
          <div className="summary-icon summary-icon--indigo"><Star size={22} /></div>
          <div className="summary-value">{summary?.average_rating ?? 0}</div>
          <div className="summary-label">Average Rating</div>
          {summary?.average_rating > 0 && <StarDisplay value={summary.average_rating} />}
        </div>
        <div className="summary-card summary-card--green">
          <div className="summary-icon summary-icon--green"><BookOpen size={22} /></div>
          <div className="summary-value">{summary?.total_programs ?? 0}</div>
          <div className="summary-label">Programs Reviewed</div>
        </div>
        <div className="summary-card summary-card--amber">
          <div className="summary-icon summary-icon--amber"><Trophy size={22} /></div>
          <div className="summary-value summary-value--sm">
            {summary?.top_rated_program ?? '—'}
          </div>
          <div className="summary-label">Top Rated Program</div>
          {summary?.top_rated_program_avg && (
            <div className="summary-sub">{summary.top_rated_program_avg} avg rating</div>
          )}
        </div>
      </div>

      {/* Rating Distribution Chart */}
      <div className="analytics-card">
        <h2><BarChart2 size={17} className="card-title-icon" /> Rating Distribution</h2>
        {summary?.total_feedback === 0 ? (
          <p className="no-data">No feedback data available yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ratingChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 13 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [value, 'Responses']}
                labelFormatter={(label) => `Rating ${label}`}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {ratingChartData.map((entry) => (
                  <Cell key={entry.rating} fill={RATING_COLORS[entry.rating - 1]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
        <div className="rating-legend">
          {[1, 2, 3, 4, 5].map((r) => (
            <span key={r} className="legend-item">
              <span className="legend-dot" style={{ background: RATING_COLORS[r - 1] }} />
              {r} – {RATING_LABELS[r]}
            </span>
          ))}
        </div>
      </div>

      {/* Program Performance Table */}
      <div className="analytics-card">
        <h2><BookOpen size={17} className="card-title-icon" /> Program Performance</h2>
        {programs.length === 0 ? (
          <p className="no-data">No program data available yet.</p>
        ) : (
          <div className="programs-table-wrapper">
            <table className="programs-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Program</th>
                  <th>Responses</th>
                  <th>Avg Rating</th>
                  <th>Rating Bar</th>
                  <th>Distribution</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((prog, idx) => {
                  const maxCount = Math.max(...prog.rating_distribution.map((d) => d.count), 1);
                  return (
                    <tr key={prog.program_name}>
                      <td className="rank-cell">{idx + 1}</td>
                      <td className="program-name-cell">{prog.program_name}</td>
                      <td>{prog.total_count}</td>
                      <td>
                        <span
                          className={`avg-badge ${
                            prog.average_rating >= 4.5
                              ? 'avg-excellent'
                              : prog.average_rating >= 3.5
                              ? 'avg-good'
                              : prog.average_rating >= 2.5
                              ? 'avg-average'
                              : 'avg-poor'
                          }`}
                        >
                          {prog.average_rating.toFixed(1)} &#9733;
                        </span>
                      </td>
                      <td className="rating-bar-cell">
                        <div className="rating-bar-track">
                          <div
                            className="rating-bar-fill"
                            style={{
                              width: `${(prog.average_rating / 5) * 100}%`,
                              background:
                                prog.average_rating >= 4 ? '#22c55e' :
                                prog.average_rating >= 3 ? '#eab308' : '#ef4444',
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="mini-dist">
                          {prog.rating_distribution.map((d) => (
                            <div
                              key={d.rating}
                              className="mini-bar"
                              title={`${d.rating}★: ${d.count}`}
                              style={{
                                height: `${d.count > 0 ? Math.max(4, (d.count / maxCount) * 28) : 4}px`,
                                background: RATING_COLORS[d.rating - 1],
                              }}
                            />
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Analytics;
