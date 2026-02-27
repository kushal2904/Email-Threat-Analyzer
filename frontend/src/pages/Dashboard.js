import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTrash2, FiRefreshCw } from 'react-icons/fi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const Dashboard = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalScans, setTotalScans] = useState(0);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/history`);
      setScans(response.data.scans);
      setTotalScans(response.data.total);
    } catch (err) {
      setError('Failed to fetch scan history');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScan = async (scanId) => {
    if (!window.confirm('Are you sure you want to delete this scan?')) return;

    try {
      await axios.delete(`${API_URL}/delete/${scanId}`);
      setScans(scans.filter(s => s.id !== scanId));
    } catch (err) {
      setError('Failed to delete scan');
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Safe':
        return '#10b981';
      case 'Suspicious':
        return '#f59e0b';
      case 'High Risk':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <h1>Dashboard</h1>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Scan History</h1>
        <button className="btn btn-secondary" onClick={fetchHistory}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <p className="subtitle">Total Scans: {totalScans}</p>

      {error && <div className="alert alert-error">{error}</div>}

      {scans.length === 0 ? (
        <div className="card empty-state">
          <p>No scans yet. Start by analyzing an email header!</p>
        </div>
      ) : (
        <div className="scans-table">
          <div className="table-header">
            <div>Domain</div>
            <div>Email</div>
            <div>Risk Level</div>
            <div>Score</div>
            <div>File</div>
            <div>Date</div>
            <div>Action</div>
          </div>

          {scans.map((scan) => (
            <div key={scan.id} className="table-row">
              <div className="cell">{scan.sender_domain}</div>
              <div className="cell">{scan.sender_email}</div>
              <div className="cell">
                <span
                  className="risk-badge"
                  style={{ '--risk-color': getRiskColor(scan.risk_level) }}
                >
                  {scan.risk_level}
                </span>
              </div>
              <div className="cell">{Math.round(scan.threat_score)}</div>
              <div className="cell">{scan.file_name || '-'}</div>
              <div className="cell">
                {new Date(scan.created_at).toLocaleDateString()}
              </div>
              <div className="cell action">
                <button
                  className="btn-icon"
                  onClick={() => handleDeleteScan(scan.id)}
                  title="Delete scan"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .dashboard {
          margin-top: 2rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .dashboard h1 {
          font-size: 2.5rem;
          color: var(--accent-blue);
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: var(--text-secondary);
        }

        .scans-table {
          background-color: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          overflow-x: auto;
        }

        .table-header {
          display: grid;
          grid-template-columns: 1.5fr 1.5fr 1fr 0.8fr 1fr 1.2fr 0.8fr;
          gap: 1rem;
          padding: 1rem;
          background-color: rgba(59, 130, 246, 0.1);
          border-bottom: 2px solid var(--border-color);
          font-weight: 600;
          color: var(--accent-blue);
          position: sticky;
          top: 0;
        }

        .table-row {
          display: grid;
          grid-template-columns: 1.5fr 1.5fr 1fr 0.8fr 1fr 1.2fr 0.8fr;
          gap: 1rem;
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
          align-items: center;
          transition: background-color 0.3s ease;
        }

        .table-row:hover {
          background-color: rgba(59, 130, 246, 0.05);
        }

        .cell {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .risk-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--risk-color);
          font-weight: 600;
          font-size: 0.875rem;
          border: 1px solid var(--risk-color);
        }

        .btn-icon {
          background: none;
          border: none;
          color: var(--accent-red);
          cursor: pointer;
          font-size: 1.125rem;
          padding: 0.25rem;
          transition: all 0.3s ease;
        }

        .btn-icon:hover {
          color: #dc2626;
          transform: scale(1.1);
        }

        .action {
          text-align: center;
        }

        @media (max-width: 1024px) {
          .table-header,
          .table-row {
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
