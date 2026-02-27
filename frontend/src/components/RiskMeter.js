import React from 'react';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const RiskMeter = ({ score, riskLevel }) => {
  const getColor = (level) => {
    switch (level) {
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

  const getIcon = (level) => {
    return level === 'Safe' ? <FiCheckCircle /> : <FiAlertCircle />;
  };

  const color = getColor(riskLevel);

  return (
    <div className="risk-meter card">
      <h3>Risk Assessment</h3>
      <div className="meter-container">
        <div className="meter-circular" style={{ '--gradient-color': color }}>
          <div className="meter-inner">
            <div className="meter-score">{Math.round(score)}</div>
            <div className="meter-label">Risk Score</div>
          </div>
          <svg className="meter-ring" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="3"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeDasharray={`${2.827 * score} 282.7`}
              strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
            />
          </svg>
        </div>
        <div className="meter-status" style={{ color }}>
          <div className="status-icon">{getIcon(riskLevel)}</div>
          <div className="status-text">{riskLevel}</div>
        </div>
      </div>

      <style>{`
        .risk-meter {
          text-align: center;
        }

        .meter-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .meter-circular {
          position: relative;
          width: 150px;
          height: 150px;
        }

        .meter-inner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .meter-score {
          font-size: 2rem;
          font-weight: bold;
          color: var(--text-primary);
        }

        .meter-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .meter-ring {
          width: 100%;
          height: 100%;
        }

        .meter-status {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .status-icon {
          display: flex;
          font-size: 1.75rem;
        }

        .status-text {
          font-size: 1.125rem;
        }
      `}</style>
    </div>
  );
};

export default RiskMeter;
