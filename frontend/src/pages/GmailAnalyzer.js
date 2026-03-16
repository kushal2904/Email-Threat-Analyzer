import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiMail, FiArrowRight, FiX, FiLoader } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import RiskMeter from '../components/RiskMeter';
import HeaderAnalysisResult from '../components/HeaderAnalysisResult';
import FileAnalysisResult from '../components/FileAnalysisResult';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const GmailAnalyzer = () => {
  const { user } = useAuth();
  const [gmailConnected, setGmailConnected] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);

  useEffect(() => {
    // Check if Gmail is already connected
    const storedToken = localStorage.getItem('gmail_access_token');
    const isConnected = localStorage.getItem('gmail_connected') === 'true';

    if (storedToken && isConnected) {
      setAccessToken(storedToken);
      setGmailConnected(true);
    }

    // Listen for OAuth callback messages
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'GMAIL_CONNECTED') {
        setAccessToken(event.data.access_token);
        setGmailConnected(true);
        setError(null);
        localStorage.setItem('gmail_access_token', event.data.access_token);
        localStorage.setItem('gmail_connected', 'true');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleGmailConnect = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/gmail/auth-url`);
      window.open(response.data.auth_url, 'Gmail OAuth', 'width=500,height=600');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to connect Gmail');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('gmail_access_token');
    localStorage.removeItem('gmail_connected');
    setAccessToken(null);
    setGmailConnected(false);
    setEmails([]);
    setSelectedEmail(null);
    setAnalysisResults(null);
  };

  const handleFetchEmails = async () => {
    if (!accessToken) {
      setError('Please connect Gmail first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/gmail/emails`, {
        params: { access_token: accessToken }
      });
      setEmails(response.data.emails || []);

      if (!response.data.emails || response.data.emails.length === 0) {
        setError('No emails found in your inbox');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeEmail = async (email) => {
    try {
      setAnalyzing(true);
      setError(null);
      setSelectedEmail(email);

      // Parse email to extract headers
      const response = await axios.post(`${API_URL}/analyze-header`, {
        raw_header: email.headers || email.id,
        subject: email.subject || 'Email from Gmail',
        user_email: user?.email || null
      });

      setAnalysisResults(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error analyzing email');
      setAnalysisResults(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const clearSelection = () => {
    setSelectedEmail(null);
    setAnalysisResults(null);
    setError(null);
  };

  return (
    <div className="gmail-analyzer">
      <h1>Gmail Analyzer</h1>
      <p className="subtitle">
        Connect your Gmail and analyze emails directly from your inbox
      </p>

      <div className="gmail-container">
        {/* Connection Section */}
        <div className="card connection-card">
          <div className="connect-section">
            <FiMail className="mail-icon" />
            <h3>Connect Your Gmail</h3>
            <p className="text-secondary">
              Authorize this app to access your Gmail (read-only). We will never store your
              credentials.
            </p>

            {!gmailConnected ? (
              <button
                className="btn btn-primary mt-2"
                onClick={handleGmailConnect}
                disabled={loading}
              >
                {loading ? 'Connecting...' : 'Connect Gmail'}
              </button>
            ) : (
              <div>
                <div className="connected-badge">
                  <span>✓ Gmail Connected</span>
                </div>
                <button className="btn btn-secondary mt-2" onClick={handleDisconnect}>
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>

        {error && <div className="alert alert-error mt-3">{error}</div>}

        {/* Emails Section */}
        {gmailConnected && !selectedEmail && (
          <div>
            {emails.length === 0 ? (
              <div className="card">
                <div className="fetch-section">
                  <h3>Fetch Your Emails</h3>
                  <p className="text-secondary">
                    Load your recent emails from Gmail to analyze them for threats
                  </p>
                  <button
                    className="btn btn-primary mt-2"
                    onClick={handleFetchEmails}
                    disabled={loading}
                  >
                    {loading ? 'Fetching...' : 'Load Recent Emails'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="card">
                <h3 className="emails-title">
                  Your Emails ({emails.length})
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleFetchEmails}
                    disabled={loading}
                  >
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </h3>

                <div className="emails-list">
                  {emails.map((email, idx) => (
                    <div key={idx} className="email-item">
                      <div className="email-left">
                        <div className="email-from">{email.from || 'Unknown'}</div>
                        <div className="email-subject">{email.subject || '(No Subject)'}</div>
                        <div className="email-date">{email.date || 'Unknown date'}</div>
                      </div>
                      <button
                        className="btn btn-primary analyze-btn"
                        onClick={() => handleAnalyzeEmail(email)}
                        disabled={analyzing}
                      >
                        {analyzing ? 'Analyzing...' : 'Analyze'}
                        <FiArrowRight />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analysis Results Section */}
        {selectedEmail && analysisResults && (
          <div className="analysis-container">
            <div className="analysis-header">
              <h2>Analysis Results</h2>
              <button className="btn-close" onClick={clearSelection} title="Close">
                <FiX />
              </button>
            </div>

            <div className="email-preview">
              <div className="preview-info">
                <strong>From:</strong> {selectedEmail.from}
              </div>
              <div className="preview-info">
                <strong>Subject:</strong> {selectedEmail.subject}
              </div>
              <div className="preview-info">
                <strong>Date:</strong> {selectedEmail.date}
              </div>
            </div>

            {analyzing ? (
              <div className="loading-analysis">
                <FiLoader className="loading-icon" />
                <p>Analyzing email...</p>
              </div>
            ) : (
              <>
                <RiskMeter
                  score={analysisResults.threat_score}
                  riskLevel={analysisResults.risk_level}
                />
                <HeaderAnalysisResult
                  data={analysisResults}
                  riskLevel={analysisResults.risk_level}
                />

                {analysisResults.explanations && analysisResults.explanations.length > 0 && (
                  <div className="card mt-3">
                    <h3>Analysis Details</h3>
                    <ul className="explanation-list">
                      {analysisResults.explanations.map((exp, idx) => (
                        <li key={idx}>{exp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            <button className="btn btn-secondary mt-3" onClick={clearSelection}>
              Back to Emails
            </button>
          </div>
        )}
      </div>

      <style>{`
        .gmail-analyzer {
          padding: 2rem 0;
        }

        .gmail-analyzer h1 {
          font-size: 2.5rem;
          color: var(--accent-blue);
          margin-bottom: 0.5rem;
          text-align: center;
          font-weight: 700;
        }

        .subtitle {
          color: var(--text-secondary);
          margin-bottom: 2rem;
          font-size: 1.125rem;
          text-align: center;
          font-weight: 500;
        }

        .gmail-container {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .connection-card {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .connect-section {
          text-align: center;
          padding: 2rem;
          width: 100%;
        }

        .mail-icon {
          font-size: 3.5rem;
          color: var(--accent-blue);
          margin-bottom: 1.5rem;
        }

        .connect-section h3 {
          font-size: 1.5rem;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
          font-weight: 600;
        }

        .connected-badge {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background-color: rgba(16, 185, 129, 0.1);
          border: 1px solid var(--accent-green);
          border-radius: 6px;
          color: var(--accent-green);
          font-weight: 600;
          margin-top: 1rem;
        }

        [data-theme="light"] .connected-badge {
          background-color: #ecfdf5;
          border-color: #10b981;
          color: #047857;
        }

        .fetch-section {
          text-align: center;
          padding: 2rem;
        }

        .fetch-section h3 {
          color: var(--text-primary);
          margin-bottom: 0.75rem;
          font-weight: 600;
        }

        .emails-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
          font-weight: 600;
        }

        .emails-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .email-item {
          padding: 1.25rem;
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 1rem;
          align-items: center;
          transition: all 0.3s ease;
        }

        [data-theme="light"] .email-item {
          background-color: #fafbfc;
          border-color: #e8ecf1;
        }

        .email-item:hover {
          border-color: var(--accent-blue);
          box-shadow: 0 4px 12px rgba(0, 82, 204, 0.1);
        }

        .email-left {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .email-from {
          font-weight: 600;
          color: var(--accent-blue);
          font-size: 1rem;
        }

        .email-subject {
          color: var(--text-primary);
          font-size: 0.95rem;
          font-weight: 500;
        }

        .email-date {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .analyze-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          white-space: nowrap;
        }

        .mt-2 {
          margin-top: 1rem;
        }

        .mt-3 {
          margin-top: 1.5rem;
        }

        .analysis-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .analysis-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .analysis-header h2 {
          font-size: 1.75rem;
          color: var(--accent-blue);
          font-weight: 600;
        }

        .btn-close {
          background: none;
          border: none;
          color: var(--accent-red);
          cursor: pointer;
          font-size: 1.5rem;
          padding: 0.5rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
        }

        .btn-close:hover {
          color: #dc2626;
          transform: scale(1.1);
        }

        .email-preview {
          background-color: rgba(59, 130, 246, 0.05);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 1.5rem;
        }

        [data-theme="light"] .email-preview {
          background-color: #f0f4ff;
          border-color: #c7d9f7;
        }

        .preview-info {
          padding: 0.5rem 0;
          color: var(--text-primary);
          word-break: break-word;
        }

        .preview-info strong {
          color: var(--accent-blue);
          font-weight: 600;
        }

        .loading-analysis {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 3rem 2rem;
          text-align: center;
          color: var(--text-secondary);
        }

        .loading-icon {
          font-size: 2.5rem;
          color: var(--accent-blue);
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .explanation-list {
          list-style: none;
          padding: 0;
        }

        .explanation-list li {
          padding: 0.75rem 1rem;
          margin-bottom: 0.5rem;
          background-color: rgba(0, 82, 204, 0.06);
          border-left: 3px solid var(--accent-blue);
          border-radius: 0 4px 4px 0;
          color: var(--text-primary);
        }

        [data-theme="light"] .explanation-list li {
          background-color: #f0f4ff;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .gmail-analyzer h1 {
            font-size: 1.75rem;
          }

          .email-item {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .analyze-btn {
            width: 100%;
            justify-content: center;
          }

          .analysis-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .analysis-header h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default GmailAnalyzer;
