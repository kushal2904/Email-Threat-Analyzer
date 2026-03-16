import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate inputs
      if (!email || !password) {
        setError('Please enter both email and password');
        setLoading(false);
        return;
      }

      // Simulate login (in a real app, this would call a backend API)
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      // Mock successful login
      const userData = {
        email,
        name: email.split('@')[0],
        loginTime: new Date().toISOString()
      };

      login(userData);
      setEmail('');
      setPassword('');

      // Navigate to home or gmail analyzer based on preference
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoUser = {
      email: 'demo@example.com',
      name: 'Demo User',
      loginTime: new Date().toISOString()
    };
    login(demoUser);
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="gradient-blur blur-1"></div>
        <div className="gradient-blur blur-2"></div>
        <div className="gradient-blur blur-3"></div>
      </div>

      <div className="login-container">
        <div className="login-left">
          <div className="login-header-section">
            <div className="logo-wrapper">
              <div className="logo-icon">
                <FiShield size={48} />
              </div>
            </div>
            <h1>Email Threat Analyzer</h1>
            <p className="tagline">Advanced Email Security & Threat Detection</p>
          </div>

          <div className="login-card">
            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary login-btn"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="login-divider">
              <span>or continue with</span>
            </div>

            <button
              type="button"
              className="btn btn-secondary demo-btn"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              Demo Account
            </button>

            <p className="login-disclaimer">
              Demo credentials: Use any email and password (min 6 characters)
            </p>
          </div>
        </div>

        <div className="login-right">
          <div className="features-section">
            <h2>Key Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📧</div>
                <h3>Email Analysis</h3>
                <p>Paste headers and get instant threat detection</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">☁️</div>
                <h3>Gmail Integration</h3>
                <p>Directly analyze emails from your Gmail inbox</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔍</div>
                <h3>File Scanning</h3>
                <p>Check attachments for malware and threats</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Dashboard</h3>
                <p>Track your scan history and threat analytics</p>
              </div>
            </div>
          </div>

          <div className="benefits-section">
            <h3>Why Choose Us</h3>
            <ul className="benefits-list">
              <li><FiCheckCircle size={20} /> Real-time threat detection</li>
              <li><FiCheckCircle size={20} /> Advanced email header analysis</li>
              <li><FiCheckCircle size={20} /> SPF, DMARC & DKIM verification</li>
              <li><FiCheckCircle size={20} /> Domain age & reputation checking</li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          position: relative;
          overflow: hidden;
        }

        [data-theme="light"] .login-page {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f0f4f8 100%);
        }

        .login-background {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .gradient-blur {
          position: absolute;
          border-radius: 50%;
          opacity: 0.1;
          animation: float 20s ease-in-out infinite;
        }

        .blur-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, #0052cc, transparent);
          top: -250px;
          right: -250px;
        }

        .blur-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #00d4ff, transparent);
          bottom: -200px;
          left: -200px;
          animation-delay: 7s;
        }

        .blur-3 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, #0052cc, transparent);
          bottom: 100px;
          right: 100px;
          animation-delay: 14s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, 30px); }
        }

        .login-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5rem;
          max-width: 1600px;
          width: 100%;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        @media (max-width: 1024px) {
          .login-container {
            grid-template-columns: 1fr;
            gap: 3rem;
          }

          .login-right {
            display: none;
          }
        }

        .login-left {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .login-header-section {
          text-align: center;
        }

        .logo-wrapper {
          margin-bottom: 2rem;
        }

        .logo-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #0052cc 0%, #00d4ff 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          color: white;
          font-size: 2.5rem;
          box-shadow: 0 20px 60px rgba(0, 82, 204, 0.3);
          animation: float 3s ease-in-out infinite;
        }

        [data-theme="light"] .logo-icon {
          box-shadow: 0 20px 60px rgba(0, 82, 204, 0.2);
        }

        .login-header-section h1 {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #0052cc 0%, #00d4ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.5rem;
        }

        [data-theme="light"] .login-header-section h1 {
          color: #0052cc;
          -webkit-text-fill-color: current;
        }

        .tagline {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
          font-weight: 500;
        }

        [data-theme="light"] .tagline {
          color: #64748b;
        }

        .login-card {
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 82, 204, 0.3);
          border-radius: 20px;
          padding: 3rem;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1);
        }

        [data-theme="light"] .login-card {
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid #e2e8f0;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .form-group label {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          color: #0052cc;
          font-size: 1.2rem;
          pointer-events: none;
          z-index: 1;
        }

        .login-form input {
          width: 100%;
          padding: 1.1rem 1rem 1.1rem 3.2rem;
          border: 2px solid rgba(0, 82, 204, 0.3);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        [data-theme="light"] .login-form input {
          background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
          border-color: #cbd5e1;
        }

        .login-form input:focus {
          outline: none;
          border-color: #0052cc;
          background: rgba(255, 255, 255, 0.12);
          box-shadow: 0 0 0 4px rgba(0, 82, 204, 0.2);
        }

        [data-theme="light"] .login-form input:focus {
          background: #ffffff;
          border-color: #0052cc;
          box-shadow: 0 0 0 4px rgba(0, 82, 204, 0.1);
        }

        .login-form input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        [data-theme="light"] .login-form input::placeholder {
          color: #94a3b8;
        }

        .toggle-password {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          color: #0052cc;
          cursor: pointer;
          padding: 0.5rem;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
        }

        .toggle-password:hover {
          color: #003d99;
        }

        .login-btn {
          padding: 1.2rem;
          font-size: 1rem;
          font-weight: 700;
          background: linear-gradient(135deg, #0052cc 0%, #003d99 100%);
          border: none;
          border-radius: 12px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1rem;
          box-shadow: 0 8px 16px rgba(0, 82, 204, 0.3);
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0, 82, 204, 0.4);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.9rem;
          margin: 1.5rem 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        [data-theme="light"] .login-divider {
          color: #94a3b8;
        }

        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(0, 82, 204, 0.2);
        }

        [data-theme="light"] .login-divider::before,
        [data-theme="light"] .login-divider::after {
          background: #e2e8f0;
        }

        .demo-btn {
          padding: 1.2rem;
          font-size: 1rem;
          font-weight: 700;
          background: rgba(0, 82, 204, 0.2);
          border: 2px solid rgba(0, 82, 204, 0.5);
          border-radius: 12px;
          color: #0052cc;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        [data-theme="light"] .demo-btn {
          background: rgba(0, 82, 204, 0.08);
          border-color: #0052cc;
        }

        .demo-btn:hover:not(:disabled) {
          background: rgba(0, 82, 204, 0.3);
          transform: translateY(-2px);
        }

        [data-theme="light"] .demo-btn:hover:not(:disabled) {
          background: rgba(0, 82, 204, 0.15);
        }

        .login-disclaimer {
          text-align: center;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 1.5rem;
        }

        [data-theme="light"] .login-disclaimer {
          color: #64748b;
        }

        .features-section {
          color: white;
        }

        [data-theme="light"] .features-section {
          color: #1e293b;
        }

        .features-section h2 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 2rem;
          color: white;
        }

        [data-theme="light"] .features-section h2 {
          color: #1e293b;
        }

        .features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 82, 204, 0.2);
          border-radius: 16px;
          padding: 2rem;
          transition: all 0.3s ease;
        }

        [data-theme="light"] .feature-card {
          background: rgba(0, 82, 204, 0.05);
          border-color: #e2e8f0;
        }

        .feature-card:hover {
          border-color: #0052cc;
          box-shadow: 0 10px 30px rgba(0, 82, 204, 0.2);
          transform: translateY(-5px);
        }

        [data-theme="light"] .feature-card:hover {
          background: rgba(0, 82, 204, 0.08);
        }

        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .feature-card h3 {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #0052cc;
        }

        [data-theme="light"] .feature-card h3 {
          color: #0052cc;
        }

        .feature-card p {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }

        [data-theme="light"] .feature-card p {
          color: #64748b;
        }

        .benefits-section {
          background: rgba(0, 82, 204, 0.15);
          border: 1px solid rgba(0, 82, 204, 0.3);
          border-radius: 16px;
          padding: 2rem;
          backdrop-filter: blur(10px);
        }

        [data-theme="light"] .benefits-section {
          background: rgba(0, 82, 204, 0.08);
          border-color: #e2e8f0;
        }

        .benefits-section h3 {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: white;
        }

        [data-theme="light"] .benefits-section h3 {
          color: #1e293b;
        }

        .benefits-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .benefits-list li {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }

        [data-theme="light"] .benefits-list li {
          color: #334155;
        }

        .benefits-list svg {
          color: #0052cc;
          flex-shrink: 0;
        }

        .alert {
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          font-weight: 500;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.5);
          color: #ef4444;
        }

        [data-theme="light"] .alert-error {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        }
      `}</style>
    </div>
  );
};

export default Login;
