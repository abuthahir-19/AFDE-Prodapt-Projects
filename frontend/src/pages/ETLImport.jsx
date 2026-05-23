import React, { useState, useEffect, useRef } from 'react';
import { Upload, Download, History, FileText, CheckCircle2 } from 'lucide-react';
import { etlService } from '../services/feedbackService';
import './ETLImport.css';

function ETLImport() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await etlService.getJobs();
      setJobs(res.data);
    } catch {
      // non-blocking
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    const allowed = ['.csv', '.xlsx', '.xls'];
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!allowed.includes(ext)) {
      setError('Only .csv and .xlsx/.xls files are supported.');
      return;
    }
    setError('');
    setResult(null);
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }
    setUploading(true);
    setError('');
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const res = await etlService.upload(formData);
      setResult(res.data);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchJobs();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        'Upload failed. Please check your file and try again.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const classes = { completed: 'badge-success', failed: 'badge-error', running: 'badge-warn' };
    return <span className={`etl-badge ${classes[status] || 'badge-info'}`}>{status}</span>;
  };

  return (
    <div className="etl-page">
      <div className="etl-header">
        <h1><Upload size={22} className="etl-header-icon" /> ETL Data Import</h1>
        <p>Upload a CSV or Excel file to import feedback records in bulk.</p>
      </div>

      {/* Upload Card */}
      <div className="etl-card">
        <h2>Upload Feedback Dataset</h2>

        <div
          className={`drop-zone ${dragging ? 'drop-zone--active' : ''} ${selectedFile ? 'drop-zone--selected' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />
          <div className="drop-zone-icon">
            {selectedFile ? <FileText size={40} /> : <Upload size={40} />}
          </div>
          {selectedFile ? (
            <>
              <p className="drop-zone-filename">{selectedFile.name}</p>
              <p className="drop-zone-size">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </>
          ) : (
            <>
              <p className="drop-zone-label">Drag &amp; drop your file here</p>
              <p className="drop-zone-sub">or click to browse — CSV, XLSX, XLS accepted</p>
            </>
          )}
        </div>

        <div className="etl-format-hint">
          <strong>Required columns:</strong> participant_name, program_name, rating (1–5)
          &nbsp;&nbsp;|&nbsp;&nbsp;<strong>Optional:</strong> comments, submitted_date
        </div>

        {error && <div className="etl-error">{error}</div>}

        <div className="etl-actions">
          <button
            className="btn-primary"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Processing…' : <><Upload size={15} /> Upload &amp; Run ETL</>}
          </button>
          {selectedFile && (
            <button
              className="btn-secondary"
              onClick={() => { setSelectedFile(null); setError(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div className="etl-card etl-result-card">
          <h2><CheckCircle2 size={18} className="result-icon" /> Import Complete</h2>
          <div className="result-grid">
            <div className="result-stat">
              <span className="stat-value">{result.total_records}</span>
              <span className="stat-label">Total Records</span>
            </div>
            <div className="result-stat result-stat--green">
              <span className="stat-value">{result.valid_records}</span>
              <span className="stat-label">Valid Records</span>
            </div>
            <div className="result-stat result-stat--blue">
              <span className="stat-value">{result.imported_records}</span>
              <span className="stat-label">Imported</span>
            </div>
            <div className="result-stat result-stat--orange">
              <span className="stat-value">{result.invalid_records}</span>
              <span className="stat-label">Invalid (Removed)</span>
            </div>
            <div className="result-stat result-stat--gray">
              <span className="stat-value">{result.duplicate_records}</span>
              <span className="stat-label">Duplicates (Skipped)</span>
            </div>
          </div>
          <p className="result-filename">File: <strong>{result.filename}</strong> &nbsp;|&nbsp; Job #{result.job_id}</p>
        </div>
      )}

      {/* Sample Download */}
      <div className="etl-card etl-sample-card">
        <h2>Need a Sample File?</h2>
        <p>Download the template to see the expected column format.</p>
        <a
          href="/sample_feedback_template.csv"
          className="btn-outline btn-outline-icon"
          download
          onClick={(e) => {
            e.preventDefault();
            const csv = 'participant_name,program_name,rating,comments,submitted_date\nAlice Johnson,Python Fundamentals,5,Great course!,2024-01-10\nBob Smith,React Development,4,Very helpful.,2024-01-11\n';
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sample_feedback_template.csv';
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download size={15} /> Download Template
        </a>
      </div>

      {/* Job History */}
      <div className="etl-card">
        <h2><History size={17} className="card-title-icon" /> Import Job History</h2>
        {loadingJobs ? (
          <p className="etl-loading">Loading job history…</p>
        ) : jobs.length === 0 ? (
          <p className="etl-empty">No import jobs yet. Upload a file to get started.</p>
        ) : (
          <div className="jobs-table-wrapper">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Filename</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Valid</th>
                  <th>Invalid</th>
                  <th>Duplicates</th>
                  <th>Imported</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.job_id}>
                    <td>#{job.job_id}</td>
                    <td className="job-filename">{job.filename}</td>
                    <td>{getStatusBadge(job.status)}</td>
                    <td>{job.total_records}</td>
                    <td>{job.valid_records}</td>
                    <td className={job.invalid_records > 0 ? 'cell-warn' : ''}>{job.invalid_records}</td>
                    <td className={job.duplicate_records > 0 ? 'cell-warn' : ''}>{job.duplicate_records}</td>
                    <td className="cell-success">{job.imported_records}</td>
                    <td>{formatDate(job.created_at)}</td>
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

export default ETLImport;
