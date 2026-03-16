import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code) {
          setError('No authorization code received from Google');
          setLoading(false);
          return;
        }

        // Exchange the code for a token
        const response = await axios.post(`${API_URL}/gmail/connect`, {
          auth_code: code
        });

        if (response.data.access_token) {
          // Store the token in localStorage
          localStorage.setItem('gmail_access_token', response.data.access_token);
          localStorage.setItem('gmail_connected', 'true');

          // Close the popup/redirect and notify parent window
          if (window.opener) {
            window.opener.postMessage({
              type: 'GMAIL_CONNECTED',
              access_token: response.data.access_token
            }, window.location.origin);
            window.close();
          } else {
            // Fallback: redirect to Gmail analysis page
            navigate('/gmail', { state: { gmailConnected: true, accessToken: response.data.access_token } });
          }
        } else {
          setError('Failed to get access token');
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err.response?.data?.detail || 'Failed to connect Gmail account');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="oauth-callback">
      <div className="callback-container">
        {loading && <p>Connecting your Gmail account...</p>}
        {error && (
          <div className="alert alert-error">
            <p>{error}</p>
            <p className="text-secondary">You can close this window and try again.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
