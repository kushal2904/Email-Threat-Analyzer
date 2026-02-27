import React from 'react';
import { FiAlertTriangle, FiCheckCircle, FiFile } from 'react-icons/fi';

const FileAnalysisResult = ({ data }) => {
  if (!data) return null;

  const getMalwareIcon = (status) => {
    if (status === 'Clean') return <FiCheckCircle className="text-success" />;
    if (status === 'Malicious') return <FiAlertTriangle className="text-danger" />;
    return <FiAlertTriangle className="text-warning" />;
  };

  const getMalwareColor = (status) => {
    if (status === 'Clean') return 'text-success';
    if (status === 'Malicious') return 'text-danger';
    return 'text-warning';
  };

  return (
    <div className="file-analysis card">
      <h3>File Analysis</h3>

      <div className="file-header">
        <FiFile className="file-icon" />
        <div className="file-info">
          <p className="file-name">{data.file_name || 'Unknown'}</p>
          <p className="file-size">{(data.file_size / 1024).toFixed(2)} KB</p>
        </div>
      </div>

      <div className="malware-status mt-2">
        <div className="status-badge" style={{ color: getMalwareColor(data.malware_status) }}>
          {getMalwareIcon(data.malware_status)}
          <span>{data.malware_status || 'Unknown'}</span>
        </div>
      </div>

      {data.sha256 && (
        <div className="hash-info mt-3">
          <label>SHA-256 Hash:</label>
          <code className="hash-value">{data.sha256}</code>
        </div>
      )}

      {data.md5 && (
        <div className="hash-info mt-2">
          <label>MD5 Hash:</label>
          <code className="hash-value">{data.md5}</code>
        </div>
      )}

      {data.virustotal && (
        <div className="vt-results mt-3">
          <h4>VirusTotal Results</h4>
          <div className="vt-stats">
            <div className="vt-stat">
              <span className="stat-label">Malicious</span>
              <span className="stat-value text-danger">
                {data.virustotal.malicious_count || 0}
              </span>
            </div>
            <div className="vt-stat">
              <span className="stat-label">Suspicious</span>
              <span className="stat-value text-warning">
                {data.virustotal.suspicious_count || 0}
              </span>
            </div>
            <div className="vt-stat">
              <span className="stat-label">Undetected</span>
              <span className="stat-value">
                {data.virustotal.undetected_count || 0}
              </span>
            </div>
            <div className="vt-stat">
              <span className="stat-label">Harmless</span>
              <span className="stat-value text-success">
                {data.virustotal.harmless_count || 0}
              </span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .file-analysis h3,
        .file-analysis h4 {
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .file-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background-color: rgba(59, 130, 246, 0.1);
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .file-icon {
          font-size: 2rem;
          color: var(--accent-blue);
          flex-shrink: 0;
        }

        .file-info {
          flex: 1;
        }

        .file-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .file-size {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .malware-status {
          display: flex;
          justify-content: center;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 1.125rem;
        }

        .hash-info {
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 1rem;
          background-color: rgba(255, 255, 255, 0.02);
        }

        .hash-info label {
          display: block;
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .hash-value {
          display: block;
          background-color: rgba(0, 0, 0, 0.3);
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          word-break: break-all;
          color: var(--accent-green);
          font-family: 'Courier New', monospace;
        }

        .vt-results {
          border-top: 1px solid var(--border-color);
          padding-top: 1rem;
        }

        .vt-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 1rem;
        }

        .vt-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background-color: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default FileAnalysisResult;
