import React from 'react';
import { FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi';

const HeaderAnalysisResult = ({ data, riskLevel }) => {
  if (!data) return null;

  const getSafetyMessage = (level) => {
    switch (level) {
      case 'Safe':
        return {
          title: '✓ This email looks safe',
          message: 'We didn\'t find any red flags. It\'s generally safe to open.',
          icon: <FiCheckCircle />,
          color: '#10b981'
        };
      case 'Suspicious':
        return {
          title: '⚠ This email seems suspicious',
          message: 'We found some unusual signs. Be careful before clicking links or downloading files.',
          icon: <FiAlertTriangle />,
          color: '#f59e0b'
        };
      case 'High Risk':
        return {
          title: '🚫 This email is high risk',
          message: 'We strongly recommend NOT opening this email. It may be dangerous.',
          icon: <FiAlertTriangle />,
          color: '#ef4444'
        };
      default:
        return {
          title: 'Unknown',
          message: 'Unable to determine email safety.',
          icon: <FiInfo />,
          color: '#6b7280'
        };
    }
  };

  const safety = getSafetyMessage(riskLevel);

  return (
    <div className="header-analysis card">
      <h3>Email Details</h3>

      <div className="safety-alert" style={{ borderLeftColor: safety.color }}>
        <div className="safety-icon" style={{ color: safety.color }}>
          {safety.icon}
        </div>
        <div className="safety-content">
          <div className="safety-title">{safety.title}</div>
          <div className="safety-message">{safety.message}</div>
        </div>
      </div>

      <div className="email-info-simple">
        <div className="info-row">
          <label>From:</label>
          <p>{data.sender_email || 'Unknown'}</p>
        </div>

        <div className="info-row">
          <label>Subject:</label>
          <p>{data.subject || '(No Subject)'}</p>
        </div>

        {data.sender_domain && (
          <div className="info-row">
            <label>Domain:</label>
            <p>{data.sender_domain}</p>
          </div>
        )}
      </div>


      <style>{`
        .header-analysis h3 {
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }

        .safety-alert {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background-color: rgba(255, 255, 255, 0.05);
          border-left: 4px solid;
          border-radius: 4px;
          margin-bottom: 1.5rem;
        }

        .safety-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        .safety-content {
          flex: 1;
        }

        .safety-title {
          font-weight: 600;
          font-size: 1rem;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .safety-message {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .email-info-simple {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .info-row {
          padding: 0.75rem;
          background-color: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
          border-left: 2px solid var(--primary-color);
        }

        .info-row label {
          display: block;
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .info-row p {
          color: var(--text-primary);
          word-break: break-word;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default HeaderAnalysisResult;
