import React, { useState } from 'react';
import axios from 'axios';
import { FiUpload, FiInfo } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import RiskMeter from '../components/RiskMeter';
import HeaderAnalysisResult from '../components/HeaderAnalysisResult';
import FileAnalysisResult from '../components/FileAnalysisResult';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const Home = () => {
  const { user } = useAuth();
  const [analysisMode, setAnalysisMode] = useState('combined'); // 'combined' or 'attachment'
  const [rawHeader, setRawHeader] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [scanId, setScanId] = useState(null);
  const [showHeaderHelp, setShowHeaderHelp] = useState(false);

  const handleHeaderAnalysis = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/analyze-header`, {
        raw_header: rawHeader,
        subject: 'Email Subject',
        user_email: user?.email || null
      });

      setScanId(response.data.scan_id);
      setResults(response.data);
      setRawHeader('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error analyzing header');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to analyze');
      return;
    }

    if (analysisMode === 'combined' && !scanId) {
      setError('Please analyze email header first');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // For attachment-only mode, generate a temporary scan ID
      const currentScanId = scanId || 'file-' + Date.now();
      formData.append('scan_id', currentScanId);

      const response = await axios.post(`${API_URL}/analyze-file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (analysisMode === 'attachment') {
        // For attachment-only analysis, set complete results
        setResults({
          scan_id: currentScanId,
          file_name: response.data.file_name,
          file_size: response.data.file_size,
          sha256: response.data.sha256,
          threat_score: response.data.threat_score,
          risk_level: response.data.risk_level,
          file_malware_status: response.data.file_malware_status,
          file_details: response.data.file_details,
          virustotal: response.data.virustotal,
          explanations: response.data.explanations,
          md5: response.data.md5
        });
      } else {
        // For combined mode, merge with existing results
        setResults(prev => ({
          ...prev,
          ...response.data
        }));
      }
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error analyzing file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <h1>Email Threat Analysis</h1>
      <p className="subtitle">Analyze email headers and attachments for security threats</p>

      {/* Analysis Mode Selector */}
      <div className="mode-selector">
        <button
          className={`mode-btn ${analysisMode === 'combined' ? 'active' : ''}`}
          onClick={() => {
            setAnalysisMode('combined');
            setResults(null);
            setError(null);
            setFile(null);
            setRawHeader('');
            setScanId(null);
          }}
        >
          📧 Email + Attachment
        </button>
        <button
          className={`mode-btn ${analysisMode === 'attachment' ? 'active' : ''}`}
          onClick={() => {
            setAnalysisMode('attachment');
            setResults(null);
            setError(null);
            setFile(null);
            setRawHeader('');
            setScanId(null);
          }}
        >
          📎 Attachment Only
        </button>
      </div>

      <div className="analysis-container">
        <div className="input-section">
          {/* Combined Mode: Header and File Upload Side by Side */}
          {analysisMode === 'combined' && (
            <div className="form-columns">
              {/* Left Column: Email Header */}
              <div className="card">
                <h3>Step 1: Paste Email Header</h3>
                <form onSubmit={handleHeaderAnalysis}>
                  <div className="form-group">
                    <div className="label-with-help">
                      <label htmlFor="header">Raw Email Header</label>
                      <button 
                        type="button"
                        className="help-icon-btn"
                        onClick={() => setShowHeaderHelp(!showHeaderHelp)}
                        title="How to find and copy email headers"
                      >
                        <FiInfo />
                      </button>
                    </div>
                    {showHeaderHelp && (
                      <div className="help-modal">
                        <div className="help-content">
                          <h4>How to Find & Copy Email Headers</h4>
                          
                          <div className="help-section">
                            <h5>📧 Gmail</h5>
                            <ol>
                              <li>Open the email you want to analyze</li>
                              <li>Click the three dots (...) menu at the top</li>
                              <li>Select "Show original" or "View message source"</li>
                              <li>Select all text (Ctrl+A) and copy (Ctrl+C)</li>
                            </ol>
                          </div>

                          <div className="help-section">
                            <h5>📬 Outlook / Microsoft 365</h5>
                            <ol>
                              <li>Open the email</li>
                              <li>Click "File" → "Info" → "Properties"</li>
                              <li>Or click the three dots (...) and select "View message details"</li>
                              <li>Copy all the header information</li>
                            </ol>
                          </div>

                          <div className="help-section">
                            <h5>🐦 Apple Mail</h5>
                            <ol>
                              <li>Open the email</li>
                              <li>Go to View → Message → Long Headers</li>
                              <li>Copy all the header content</li>
                            </ol>
                          </div>

                          <div className="help-section">
                            <h5>📨 Thunderbird</h5>
                            <ol>
                              <li>Right-click on the email message</li>
                              <li>Select "View Message Source" or use Ctrl+U</li>
                              <li>Copy the entire header section (all lines starting with To:, From:, Date:, etc.)</li>
                            </ol>
                          </div>

                          <div className="help-tip">
                            <strong>💡 Tip:</strong> Headers typically include From, To, Date, Subject, and Received fields. Make sure to copy the complete headers including all "Received:" lines for accurate analysis.
                          </div>
                        </div>
                      </div>
                    )}
                    <textarea
                      id="header"
                      value={rawHeader}
                      onChange={(e) => setRawHeader(e.target.value)}
                      placeholder="Paste the raw email header text here (From Received headers...)"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !rawHeader.trim()}
                  >
                    {loading ? 'Analyzing...' : 'Analyze Header'}
                  </button>
                </form>
              </div>

              {/* Right Column: File Upload */}
              <div className="card">
                <h3>Step 2: Upload Attachment (Optional)</h3>
                <div className="warning-box">
                  <p className="warning-text">⚠️ <strong>Important:</strong> When you download attachments for analysis, do NOT open them before uploading to this analyzer. Opening suspicious files can compromise your system.</p>
                </div>
                <form onSubmit={handleFileUpload}>
                  <div className="form-group">
                    <label htmlFor="file" className="file-input-label">
                      <FiUpload /> Choose File
                    </label>
                    <input
                      id="file"
                      type="file"
                      onChange={(e) => setFile(e.target.files[0])}
                      accept=".exe,.zip,.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    />
                    {file && <p className="file-name">{file.name}</p>}
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !file || !scanId}
                  >
                    {loading ? 'Scanning...' : 'Scan File'}
                  </button>
                  {!scanId && (
                    <p className="help-text">ℹ️ Complete email header analysis first</p>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* Attachment-Only Mode */}
          {analysisMode === 'attachment' && (
            <div className="card">
              <h3>Upload Attachment to Analyze</h3>
              <div className="warning-box">
                <p className="warning-text">⚠️ <strong>Important:</strong> When you download attachments for analysis, do NOT open them before uploading to this analyzer. Opening suspicious files can compromise your system.</p>
              </div>
              <form onSubmit={handleFileUpload}>
                <div className="form-group">
                  <label htmlFor="file" className="file-input-label">
                    <FiUpload /> Choose File
                  </label>
                  <input
                    id="file"
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    accept=".exe,.zip,.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  />
                  {file && <p className="file-name">{file.name}</p>}
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !file}
                >
                  {loading ? 'Scanning...' : 'Scan File'}
                </button>
              </form>
            </div>
          )}

          {error && <div className="alert alert-error mt-3">{error}</div>}
        </div>

        {/* Results Section */}
        {results && (
          <div className="results-section">
            <RiskMeter score={results.threat_score} riskLevel={results.risk_level} />
            {analysisMode === 'combined' && <HeaderAnalysisResult data={results} riskLevel={results.risk_level} />}
            {results.file_name && <FileAnalysisResult data={results} />}

            {results.explanations && results.explanations.length > 0 && (
              <div className="card mt-3">
                <h3>Analysis Details</h3>
                <ul className="explanation-list">
                  {results.explanations.map((exp, idx) => (
                    <li key={idx}>{exp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .home h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: var(--accent-blue);
          text-align: center;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .subtitle {
          color: var(--text-secondary);
          margin-bottom: 2rem;
          font-size: 1.125rem;
          text-align: center;
          font-weight: 500;
        }

        .analysis-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-top: 2rem;
        }

        .input-section {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .results-section {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border-color);
        }

        .mode-selector {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .mode-btn {
          padding: 0.8rem 1.5rem;
          border: 2px solid var(--border-color);
          background-color: var(--card-bg);
          color: var(--text-primary);
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .mode-btn:hover {
          border-color: var(--accent-blue);
          background-color: rgba(0, 82, 204, 0.05);
        }

        .mode-btn.active {
          background-color: var(--accent-blue);
          color: white;
          border-color: var(--accent-blue);
        }

        .form-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
          max-width: 1000px;
          margin: 0 auto;
          width: 100%;
        }

        .form-columns .card {
          display: flex;
          flex-direction: column;
          min-height: 500px;
        }

        [data-theme="light"] .form-columns .card {
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05), 0 4px 24px rgba(0, 0, 0, 0.04);
          border: 1px solid #e8ecf1;
        }

        [data-theme="light"] .form-columns .card:hover {
          box-shadow: 0 4px 16px rgba(0, 82, 204, 0.1), 0 8px 32px rgba(0, 0, 0, 0.06);
          border-color: #d0d8e0;
        }

        .form-columns .card h3 {
          margin-bottom: 1.5rem;
          font-size: 1.25rem;
          color: var(--text-primary);
          font-weight: 600;
        }

        .form-columns form {
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 1rem;
        }

        .form-columns .form-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-bottom: 0;
        }

        .form-columns textarea {
          flex: 1;
          min-height: 200px;
          padding: 1rem;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background-color: var(--card-bg);
          color: var(--text-primary);
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          resize: vertical;
          transition: all 0.3s ease;
        }

        [data-theme="light"] .form-columns textarea {
          background-color: #fafbfc;
        }

        .form-columns textarea:focus {
          outline: none;
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 3px rgba(0, 82, 204, 0.1);
        }

        .warning-box {
          background: linear-gradient(135deg, rgba(0, 82, 204, 0.08) 0%, rgba(0, 82, 204, 0.04) 100%);
          border: 1px solid var(--accent-blue);
          border-left: 3px solid var(--accent-blue);
          border-radius: 6px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        [data-theme="light"] .warning-box {
          background: linear-gradient(135deg, #e8f0ff 0%, #f0f4ff 100%);
          border: 1px solid #c7d9f7;
          border-left: 3px solid #0052cc;
        }

        .warning-text {
          color: var(--accent-blue);
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 0;
          font-weight: 500;
        }

        [data-theme="light"] .warning-text {
          color: #003d99;
        }

        label {
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.95rem;
        }

        .label-with-help {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .help-icon-btn {
          background: none;
          border: none;
          color: var(--accent-blue);
          cursor: pointer;
          font-size: 1.2rem;
          padding: 0.25rem 0.5rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .help-icon-btn:hover {
          background-color: rgba(0, 82, 204, 0.1);
          transform: scale(1.15);
        }

        .help-modal {
          background-color: rgba(0, 82, 204, 0.05);
          border: 1px solid var(--accent-blue);
          border-radius: 6px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          max-height: 500px;
          overflow-y: auto;
        }

        [data-theme="light"] .help-modal {
          background-color: #f0f4ff;
          border: 1px solid #c7d9f7;
        }

        .help-content h4 {
          color: var(--accent-blue);
          margin-bottom: 1rem;
          font-size: 1.1rem;
          font-weight: 600;
        }

        [data-theme="light"] .help-content h4 {
          color: #0052cc;
        }

        .help-section {
          margin-bottom: 1.2rem;
        }

        .help-section h5 {
          color: var(--text-primary);
          font-size: 0.95rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .help-section ol {
          padding-left: 1.5rem;
          color: var(--text-secondary);
          font-size: 0.85rem;
          line-height: 1.6;
        }

        .help-section li {
          margin-bottom: 0.4rem;
        }

        .help-tip {
          background-color: rgba(16, 185, 129, 0.1);
          border-left: 3px solid var(--accent-green);
          padding: 0.75rem;
          border-radius: 4px;
          font-size: 0.85rem;
          color: var(--text-primary);
          line-height: 1.5;
        }

        [data-theme="light"] .help-tip {
          background-color: #ecfdf5;
          border-left-color: #10b981;
        }

        .input-section > .card {
          max-width: 600px;
          margin: 0 auto;
          width: 100%;
          min-height: 500px;
          display: flex;
          flex-direction: column;
        }

        .input-section > .card form {
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 1rem;
        }

        .input-section > .card .form-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-bottom: 0;
        }

        textarea {
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
        }

        .file-input-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 3rem 2rem;
          border: 2px dashed var(--border-color);
          border-radius: 6px;
          cursor: pointer;
          background-color: rgba(0, 82, 204, 0.02);
          transition: all 0.3s ease;
          font-weight: 600;
          min-height: 180px;
          flex-direction: column;
          color: var(--accent-blue);
        }

        [data-theme="light"] .file-input-label {
          background-color: #fafbfc;
          border-color: #d0d8e0;
          color: #0052cc;
        }

        .file-input-label:hover {
          border-color: var(--accent-blue);
          background-color: rgba(0, 82, 204, 0.08);
        }

        [data-theme="light"] .file-input-label:hover {
          background-color: #e8f0ff;
          border-color: #0052cc;
        }

        .form-columns .btn {
          margin-top: auto;
          padding: 0.875rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
        }

        input[type="file"] {
          display: none;
        }

        .file-name {
          margin-top: 0.5rem;
          color: var(--accent-green);
          font-size: 0.875rem;
          font-weight: 500;
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
          border-left-color: #0052cc;
        }

        .help-text {
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-style: italic;
          margin-top: 0.5rem;
        }

        .mt-3 {
          margin-top: 1.5rem;
        }

        .mt-2 {
          margin-top: 1rem;
        }

        .mb-2 {
          margin-bottom: 1rem;
        }

        @media (max-width: 1024px) {
          .form-columns {
            grid-template-columns: 1fr;
            max-width: 600px;
          }
        }

        @media (max-width: 768px) {
          .home h1 {
            font-size: 1.75rem;
          }

          .subtitle {
            font-size: 1rem;
          }

          .form-columns {
            gap: 1.5rem;
          }

          .form-columns .card {
            min-height: auto;
          }

          .mode-selector {
            gap: 0.75rem;
          }

          .mode-btn {
            padding: 0.6rem 1.2rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
