import React, { useState } from 'react';
import axios from 'axios';
import { FiMail } from 'react-icons/fi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const GmailAnalysis = () => {
  const [gmailConnected, setGmailConnected] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGmailConnect = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/gmail/auth-url`);
      window.open(response.data.auth_url, 'Gmail OAuth', 'width=500,height=600');
      // In a real app, you would use a callback to get the token
    } catch (err) {
      setError('Failed to connect Gmail');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchEmails = async () => {
    if (!accessToken) {
      setError('Please connect Gmail first');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/gmail/emails`, {
        params: { access_token: accessToken }
      });
      setEmails(response.data.emails);
      setError(null);
    } catch (err) {
      setError('Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gmail-analysis">
      <h1>Gmail Integration</h1>
      <p className="subtitle">Connect your Gmail account to analyze emails automatically</p>

      <div className="gmail-container">
        <div className="card">
          <div className="connect-section">
            <FiMail className="mail-icon" />
            <h3>Connect Gmail Account</h3>
            <p className="text-secondary">
              Authorize this app to access your Gmail (read-only). We will never store your credentials.
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
              <div className="connected-badge">
                <span>✓ Gmail Connected</span>
              </div>
            )}
          </div>

          {error && <div className="alert alert-error mt-3">{error}</div>}
        </div>

        {gmailConnected && (
          <div className="card mt-3">
            <h3>Your Emails</h3>
            <button
              className="btn btn-secondary mb-2"
              onClick={handleFetchEmails}
              disabled={loading}
            >
              {loading ? 'Fetching...' : 'Fetch Recent Emails'}
            </button>

            {emails.length > 0 && (
              <div className="emails-list">
                {emails.map((email, idx) => (
                  <div key={idx} className="email-item">
                    <div className="email-from">{email.from}</div>
                    <div className="email-subject">{email.subject}</div>
                    <div className="email-date">{email.date}</div>
                    <button className="btn btn-secondary btn-small">Analyze</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .gmail-analysis h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: var(--accent-blue);
        }

        .subtitle {
          color: var(--text-secondary);
          margin-bottom: 2rem;
          font-size: 1.125rem;
        }

        .gmail-container {
          max-width: 600px;
          margin: 0 auto;
        }

        .connect-section {
          text-align: center;
          padding: 2rem 0;
        }

        .mail-icon {
          font-size: 3rem;
          color: var(--accent-blue);
          margin-bottom: 1rem;
        }

        .connected-badge {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background-color: rgba(16, 185, 129, 0.1);
          border: 1px solid var(--accent-green);
          border-radius: 4px;
          color: var(--accent-green);
          font-weight: 600;
          margin-top: 1rem;
        }

        .emails-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .email-item {
          padding: 1rem;
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 1rem;
          align-items: center;
        }

        .email-from {
          font-weight: 600;
          color: var(--accent-blue);
        }

        .email-subject {
          color: var(--text-primary);
          grid-column: 1;
        }

        .email-date {
          font-size: 0.875rem;
          color: var(--text-secondary);
          grid-column: 1;
        }

        .btn-small {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          grid-column: 2;
          grid-row: 1 / 4;
        }
      `}</style>
    </div>
  );
};

export default GmailAnalysis;
