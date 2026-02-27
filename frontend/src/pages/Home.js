import React, { useState } from 'react';
import axios from 'axios';
import { FiUpload } from 'react-icons/fi';
import RiskMeter from '../components/RiskMeter';
import HeaderAnalysisResult from '../components/HeaderAnalysisResult';
import FileAnalysisResult from '../components/FileAnalysisResult';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const Home = () => {
  const [analysisMode, setAnalysisMode] = useState('combined'); // 'combined' or 'attachment'
  const [rawHeader, setRawHeader] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [scanId, setScanId] = useState(null);

  const handleHeaderAnalysis = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/analyze-header`, {
        raw_header: rawHeader,
        subject: 'Email Subject'
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
                    <label htmlFor="header">Raw Email Header</label>
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
        }

        .subtitle {
          color: var(--text-secondary);
          margin-bottom: 2rem;
          font-size: 1.125rem;
          text-align: center;
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

        .form-columns .card h3 {
          margin-bottom: 1.5rem;
          font-size: 1.25rem;
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
        }

        .warning-box {
          background-color: rgba(245, 158, 11, 0.1);
          border: 1px solid var(--accent-yellow);
          border-radius: 6px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .warning-text {
          color: var(--accent-yellow);
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 0;
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
          border-radius: 4px;
          cursor: pointer;
          background-color: rgba(255, 255, 255, 0.02);
          transition: all 0.3s ease;
          font-weight: 600;
          min-height: 180px;
          flex-direction: column;
        }

        .file-input-label:hover {
          border-color: var(--accent-blue);
          background-color: rgba(59, 130, 246, 0.1);
        }

        .form-columns .btn {
          margin-top: auto;
          padding: 0.875rem 1.5rem;
          font-size: 1rem;
        }

        input[type="file"] {
          display: none;
        }

        .file-name {
          margin-top: 0.5rem;
          color: var(--accent-green);
          font-size: 0.875rem;
        }

        .explanation-list {
          list-style: none;
          padding: 0;
        }

        .explanation-list li {
          padding: 0.75rem;
          margin-bottom: 0.5rem;
          background-color: rgba(59, 130, 246, 0.1);
          border-left: 3px solid var(--accent-blue);
          border-radius: 0 4px 4px 0;
        }

        @media (max-width: 1024px) {
          .form-columns {
            grid-template-columns: 1fr;
            max-width: 600px;
          }
        }

        @media (max-width: 768px) {
          .form-columns {
            gap: 1.5rem;
          }

          .form-columns .card {
            min-height: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
