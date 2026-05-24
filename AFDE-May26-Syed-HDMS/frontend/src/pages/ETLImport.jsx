import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { uploadCSV } from '../services/etlService';

const ETLImport = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setError('');
    setResult(null);
    if (!selected.name.endsWith('.csv')) {
      setError('Please select a CSV file.');
      setFile(null);
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10 MB limit.');
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setResult(null);
    try {
      const data = await uploadCSV(file);
      setResult(data);
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || 'Upload failed.';
      setError(detail);
    } finally {
      setUploading(false);
    }
  };

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    marginBottom: '24px',
  };

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>
        ETL Import
      </h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Upload a historical ticket CSV to extract, transform, and load data into the reporting database.
      </p>

      {/* Instructions */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1976d2', marginBottom: '16px' }}>
          CSV Format Requirements
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #e0e0e0' }}>Column</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #e0e0e0' }}>Required</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #e0e0e0' }}>Accepted Values / Notes</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['employee_name', 'Yes', 'Full name (e.g. "Alice Johnson")'],
              ['department', 'Yes', 'IT, HR, Finance, Marketing, Operations'],
              ['issue_category', 'Yes', 'VPN Issue, Password Reset, Software Installation, Laptop Issue, Email Access, Network Connectivity, Hardware Request (or common variations)'],
              ['status', 'Yes', 'Open, In Progress, Resolved, Closed (or: pending, wip, done, fixed, etc.)'],
              ['priority', 'Yes', 'Low, Medium, High, Critical (or: normal, urgent, h, etc.)'],
              ['created_date', 'Yes', 'YYYY-MM-DD or MM/DD/YYYY'],
              ['resolved_date', 'No', 'Leave blank for Open/In Progress tickets'],
            ].map(([col, req, note]) => (
              <tr key={col} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#1976d2' }}>{col}</td>
                <td style={{ padding: '8px 12px', color: req === 'Yes' ? '#c62828' : '#666' }}>{req}</td>
                <td style={{ padding: '8px 12px', color: '#555' }}>{note}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: '12px', fontSize: '13px', color: '#888' }}>
          The pipeline normalizes messy values automatically and removes duplicate tickets
          (same employee + category + date).
        </p>
      </div>

      {/* Upload Card */}
      <div style={{ ...cardStyle, border: '2px dashed #90caf9' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>
          Upload CSV File
        </h2>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => fileInputRef.current.click()}
            style={{
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              border: '1px solid #90caf9',
              borderRadius: '6px',
              padding: '10px 20px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
            }}
          >
            Choose CSV File
          </button>

          {file && (
            <span style={{ fontSize: '14px', color: '#333' }}>
              <strong>{file.name}</strong>{' '}
              <span style={{ color: '#888' }}>({formatFileSize(file.size)})</span>
            </span>
          )}

          {!file && (
            <span style={{ fontSize: '14px', color: '#aaa' }}>No file selected</span>
          )}
        </div>

        {file && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{
              marginTop: '20px',
              backgroundColor: uploading ? '#90caf9' : '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '12px 28px',
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {uploading ? 'Running ETL Pipeline...' : 'Run ETL Pipeline'}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            backgroundColor: '#ffebee',
            border: '1px solid #ef9a9a',
            borderRadius: '6px',
            padding: '16px',
            color: '#c62828',
            marginBottom: '24px',
            fontSize: '14px',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={cardStyle}>
          <div
            style={{
              backgroundColor: '#e8f5e9',
              border: '1px solid #a5d6a7',
              borderRadius: '6px',
              padding: '14px 18px',
              color: '#2e7d32',
              fontWeight: '600',
              marginBottom: '20px',
              fontSize: '15px',
            }}
          >
            ETL completed successfully!
          </div>

          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '12px' }}>
            Pipeline Summary
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <tbody>
              {[
                ['Rows Extracted from CSV', result.rows_extracted],
                ['Rows Dropped (invalid/missing fields)', result.rows_dropped_transform],
                ['Duplicates Removed', result.rows_deduplicated],
                ['Rows Loaded into Reporting DB', result.rows_loaded],
              ].map(([label, value]) => (
                <tr key={label} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px 12px', color: '#555' }}>{label}</td>
                  <td
                    style={{
                      padding: '10px 12px',
                      fontWeight: '700',
                      color: '#1976d2',
                      textAlign: 'right',
                    }}
                  >
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '20px' }}>
            <Link
              to="/analytics"
              style={{
                display: 'inline-block',
                backgroundColor: '#1976d2',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '6px',
                padding: '10px 22px',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              View Analytics Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ETLImport;
