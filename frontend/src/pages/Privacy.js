import React, { useState } from 'react';
import axios from 'axios';
import { FiTrash2, FiAlertTriangle } from 'react-icons/fi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const Privacy = () => {
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleDeleteAll = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete ALL scans? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      setDeleteInProgress(true);
      const response = await axios.delete(`${API_URL}/delete-all`);
      setMessage(`Successfully deleted ${response.data.deleted_count} scans`);
      setError(null);
    } catch (err) {
      setError('Failed to delete scans');
    } finally {
      setDeleteInProgress(false);
    }
  };

  const handleDeleteByDate = async (days) => {
    const confirmed = window.confirm(
      `Delete all scans older than ${days} days?`
    );
    if (!confirmed) return;

    try {
      setDeleteInProgress(true);
      const response = await axios.post(`${API_URL}/delete-by-date`, { days_old: days });
      setMessage(`Successfully deleted ${response.data.deleted_count} scans`);
      setError(null);
    } catch (err) {
      setError('Failed to delete scans');
    } finally {
      setDeleteInProgress(false);
    }
  };

  return (
    <div className="privacy">
      <h1>Privacy & Data Management</h1>
      <p className="subtitle">Control your stored data and privacy settings</p>

      <div className="privacy-container">
        {/* Data Policy */}
        <div className="card">
          <h3>Data Policy</h3>
          <div className="policy-section">
            <h4>What we store</h4>
            <ul>
              <li>Email headers and analysis results</li>
              <li>File hashes and scan results</li>
              <li>IP location information</li>
              <li>Domain information from WHOIS</li>
            </ul>

            <h4 className="mt-3">What we DON'T store</h4>
            <ul>
              <li>Gmail credentials or tokens (OAuth only)</li>
              <li>Actual file contents (only file hashes)</li>
              <li>Email body content</li>
              <li>Attachments</li>
            </ul>

            <h4 className="mt-3">External APIs</h4>
            <p>
              This application uses the following external APIs:
            </p>
            <ul>
              <li><strong>VirusTotal:</strong> File reputation checking</li>
              <li><strong>IPInfo:</strong> IP geolocation</li>
              <li><strong>Gmail API:</strong> Email access with your permission</li>
              <li><strong>DNS Records:</strong> SPF, DMARC, DKIM checks</li>
            </ul>
          </div>
        </div>

        {/* Delete Options */}
        <div className="card">
          <h3>Delete Data</h3>
          
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <div className="delete-section mt-3">
            <div className="delete-option">
              <FiTrash2 className="warning-icon" />
              <div>
                <h4>Delete Recent Scans</h4>
                <p>Delete scans older than specified days</p>
                <div className="button-group">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDeleteByDate(7)}
                    disabled={deleteInProgress}
                  >
                    7 Days
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDeleteByDate(30)}
                    disabled={deleteInProgress}
                  >
                    30 Days
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDeleteByDate(90)}
                    disabled={deleteInProgress}
                  >
                    90 Days
                  </button>
                </div>
              </div>
            </div>

            <div className="delete-option mt-3">
              <FiAlertTriangle className="danger-icon" />
              <div>
                <h4>Delete All Data</h4>
                <p>Permanently delete all stored scans and analysis results</p>
                <button
                  className="btn btn-danger"
                  onClick={handleDeleteAll}
                  disabled={deleteInProgress}
                >
                  {deleteInProgress ? 'Deleting...' : 'Delete All Scans'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="card">
          <h3>About This Application</h3>
          <div className="about-section">
            <p>
              <strong>Intelligent Email Threat Analyzer</strong> is a cybersecurity tool
              that helps you identify spoofed emails and malicious attachments.
            </p>
            
            <h4 className="mt-3">Features</h4>
            <ul>
              <li>Email header analysis (SPF, DMARC, DKIM)</li>
              <li>File reputation checking via VirusTotal</li>
              <li>IP geolocation and threat assessment</li>
              <li>Domain age and registrar information</li>
              <li>Gmail integration for automatic analysis</li>
              <li>Threat scoring engine with explainable results</li>
            </ul>

            <h4 className="mt-3">Disclaimer</h4>
            <p>
              This application provides analysis tools for educational and security purposes.
              Results should not be considered 100% accurate. Always verify with your email
              provider or security team for critical decisions.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .privacy h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: var(--accent-blue);
        }

        .subtitle {
          color: var(--text-secondary);
          margin-bottom: 2rem;
          font-size: 1.125rem;
        }

        .privacy-container {
          display: grid;
          gap: 1.5rem;
        }

        .policy-section,
        .about-section {
          line-height: 1.8;
        }

        h4 {
          color: var(--accent-blue);
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }

        ul {
          margin-left: 1.5rem;
          list-style: disc;
        }

        ul li {
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .delete-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .delete-option {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          background-color: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
          border: 1px solid var(--border-color);
        }

        .warning-icon {
          font-size: 1.5rem;
          color: var(--accent-yellow);
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        .danger-icon {
          font-size: 1.5rem;
          color: var(--accent-red);
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        .delete-option h4 {
          margin-top: 0;
        }

        .delete-option p {
          color: var(--text-secondary);
          margin-top: 0.25rem;
          margin-bottom: 0.75rem;
        }

        .button-group {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};

export default Privacy;
