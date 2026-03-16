import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTrash2, FiRefreshCw, FiBarChart2 } from 'react-icons/fi';
import ReactECharts from 'echarts-for-react';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalScans, setTotalScans] = useState(0);
  const [chartData, setChartData] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchHistory();
  }, [user]);

  useEffect(() => {
    if (scans.length > 0) {
      generateChartData(scans);
    }
  }, [scans]);

  const generateChartData = (scansData) => {
    // Risk distribution (pie chart)
    const riskCounts = {
      'Safe': 0,
      'Suspicious': 0,
      'High Risk': 0
    };
    
    let totalScore = 0;
    const scores = [];
    const threatScores = [];

    scansData.forEach(scan => {
      riskCounts[scan.risk_level]++;
      totalScore += scan.threat_score;
      scores.push(scan.threat_score);
      threatScores.push({
        date: new Date(scan.created_at).toLocaleDateString(),
        score: scan.threat_score
      });
    });

    setChartData({
      riskDistribution: {
        safe: riskCounts['Safe'],
        suspicious: riskCounts['Suspicious'],
        highRisk: riskCounts['High Risk']
      },
      averageScore: (totalScore / scansData.length).toFixed(1),
      scores,
      threatScores
    });
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const userEmail = user?.email || '';
      const response = await axios.get(`${API_URL}/history`, {
        params: { user_email: userEmail }
      });
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
      const userEmail = user?.email || '';
      await axios.delete(`${API_URL}/delete/${scanId}`, {
        params: { user_email: userEmail }
      });
      setScans(scans.filter(s => s.id !== scanId));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete scan');
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

  const getRiskPieOption = () => {
    if (!chartData) return {};
    return {
      title: {
        text: 'Risk Distribution',
        left: 'center',
        textStyle: { color: 'var(--text-primary)' }
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: { color: 'var(--text-secondary)' }
      },
      series: [
        {
          name: 'Emails',
          type: 'pie',
          radius: '50%',
          data: [
            { value: chartData.riskDistribution.safe, name: 'Safe', itemStyle: { color: '#10b981' } },
            { value: chartData.riskDistribution.suspicious, name: 'Suspicious', itemStyle: { color: '#f59e0b' } },
            { value: chartData.riskDistribution.highRisk, name: 'High Risk', itemStyle: { color: '#ef4444' } }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  };

  const getThreatScoreHistogramOption = () => {
    if (!chartData) return {};
    return {
      title: {
        text: 'Threat Score Distribution',
        left: 'center',
        textStyle: { color: 'var(--text-primary)' }
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: Array.from({ length: 11 }, (_, i) => i * 10),
        axisLabel: { color: 'var(--text-secondary)' },
        axisLine: { lineStyle: { color: 'var(--border-color)' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: 'var(--text-secondary)' },
        axisLine: { lineStyle: { color: 'var(--border-color)' } },
        splitLine: { lineStyle: { color: 'var(--border-color)' } }
      },
      series: [
        {
          name: 'Count',
          type: 'bar',
          data: Array.from({ length: 11 }, (_, i) => {
            const min = i * 10;
            const max = (i + 1) * 10;
            return chartData.scores.filter(s => s >= min && s < max).length;
          }),
          itemStyle: { color: '#3b82f6' }
        }
      ]
    };
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
        <h1>Dashboard & Analytics</h1>
        <button className="btn btn-secondary" onClick={fetchHistory}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <p className="subtitle">Total Scans: {totalScans} | Average Risk Score: {chartData?.averageScore || 0}</p>

      {error && <div className="alert alert-error">{error}</div>}

      {scans.length === 0 ? (
        <div className="card empty-state">
          <p>No scans yet. Start by analyzing an email header!</p>
        </div>
      ) : (
        <>
          {/* Charts Section */}
          <div className="charts-container">
            <div className="chart-wrapper">
              <h3>Risk Distribution</h3>
              <ReactECharts option={getRiskPieOption()} style={{ height: '400px' }} />
            </div>
            <div className="chart-wrapper">
              <h3>Threat Score Distribution</h3>
              <ReactECharts option={getThreatScoreHistogramOption()} style={{ height: '400px' }} />
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="stats-cards">
            <div className="stat-card safe">
              <div className="stat-value">{chartData?.riskDistribution.safe}</div>
              <div className="stat-label">Safe Emails</div>
            </div>
            <div className="stat-card suspicious">
              <div className="stat-value">{chartData?.riskDistribution.suspicious}</div>
              <div className="stat-label">Suspicious Emails</div>
            </div>
            <div className="stat-card high-risk">
              <div className="stat-value">{chartData?.riskDistribution.highRisk}</div>
              <div className="stat-label">High Risk Emails</div>
            </div>
          </div>

          {/* Scan History Table */}
          <div className="history-section">
            <h2><FiBarChart2 /> Scan History</h2>
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
          </div>
        </>
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

        .dashboard h2 {
          font-size: 1.5rem;
          color: var(--accent-blue);
          margin-top: 2rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
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

        /* Charts Container */
        .charts-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .chart-wrapper {
          background-color: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .chart-wrapper h3 {
          margin: 0 0 1.5rem 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .chart-wrapper.full-width {
          grid-column: 1 / -1;
        }

        /* Statistics Cards */
        .stats-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
          border: 2px solid;
          background-color: rgba(255, 255, 255, 0.02);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .stat-card.safe {
          border-color: #10b981;
          color: #10b981;
        }

        .stat-card.suspicious {
          border-color: #f59e0b;
          color: #f59e0b;
        }

        .stat-card.high-risk {
          border-color: #ef4444;
          color: #ef4444;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.875rem;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* History Section */
        .history-section {
          margin-top: 2rem;
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

        @media (max-width: 1200px) {
          .charts-container {
            grid-template-columns: 1fr;
          }

          .chart-wrapper {
            min-height: 350px;
          }
        }

        @media (max-width: 1024px) {
          .table-header,
          .table-row {
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          }

          .stats-cards {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .dashboard h1 {
            font-size: 1.75rem;
          }

          .chart-wrapper {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
