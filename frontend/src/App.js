import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiMail, FiBarChart2, FiShield, FiSun, FiMoon, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import GmailAnalyzer from './pages/GmailAnalyzer';
import OAuthCallback from './pages/OAuthCallback';
import Dashboard from './pages/Dashboard';
import Privacy from './pages/Privacy';

function NavBar() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <FiShield className="logo" />
          <span>Email Threat Analyzer</span>
        </Link>

        <button
          className="nav-menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <div className={`nav-right ${menuOpen ? 'open' : ''}`}>
          {user && (
            <ul className="nav-menu">
              <li>
                <Link
                  to="/"
                  className={`nav-link ${isActive('/') ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <FiHome /> Manual Analysis
                </Link>
              </li>
              <li>
                <Link
                  to="/gmail"
                  className={`nav-link ${isActive('/gmail') ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <FiMail /> Gmail Analyzer
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <FiBarChart2 /> Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className={`nav-link ${isActive('/privacy') ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <FiShield /> Privacy
                </Link>
              </li>
            </ul>
          )}
          <div className="nav-actions">
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <FiSun /> : <FiMoon />}
            </button>
            {user && (
              <div className="user-menu">
                <span className="user-email">{user.email}</span>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    logout();
                    navigate('/login');
                    setMenuOpen(false);
                  }}
                >
                  <FiLogOut /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .navbar {
          background-color: var(--darker-bg);
          border-bottom: 2px solid var(--accent-blue);
          padding: 1rem 0;
          box-shadow: var(--shadow);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        [data-theme="light"] .navbar {
          background-color: #ffffff;
          border-bottom-color: #0052cc;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--accent-blue);
          text-decoration: none;
          transition: all 0.3s ease;
          padding: 0.5rem 1rem;
          border-radius: 8px;
        }

        .nav-brand:hover {
          background-color: rgba(0, 82, 204, 0.1);
        }

        [data-theme="light"] .nav-brand:hover {
          background-color: #f0f4ff;
        }

        .logo {
          font-size: 1.5rem;
        }

        .nav-menu-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--accent-blue);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-menu {
          display: flex;
          list-style: none;
          gap: 0.5rem;
          margin: 0;
          padding: 0;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          color: var(--text-primary);
          padding: 0.6rem 1rem;
          border-radius: 6px;
          font-weight: 500;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }

        .nav-link:hover {
          background-color: rgba(0, 82, 204, 0.1);
          color: var(--accent-blue);
        }

        [data-theme="light"] .nav-link:hover {
          background-color: #f0f4ff;
        }

        .nav-link.active {
          background-color: rgba(0, 82, 204, 0.15);
          color: var(--accent-blue);
          border-bottom: 2px solid var(--accent-blue);
        }

        [data-theme="light"] .nav-link.active {
          background-color: #e8f0ff;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .theme-toggle-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.3rem;
          color: var(--accent-blue);
          padding: 0.5rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          border-radius: 6px;
        }

        .theme-toggle-btn:hover {
          background-color: rgba(0, 82, 204, 0.1);
          transform: scale(1.1);
        }

        [data-theme="light"] .theme-toggle-btn:hover {
          background-color: #f0f4ff;
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-email {
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .nav-container {
            padding: 0 1rem;
          }

          .nav-menu-toggle {
            display: flex;
            z-index: 1001;
          }

          .nav-right {
            position: absolute;
            top: 70px;
            left: 0;
            right: 0;
            background-color: var(--darker-bg);
            flex-direction: column;
            gap: 1rem;
            padding: 1.5rem;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
          }

          [data-theme="light"] .nav-right {
            background-color: #ffffff;
          }

          .nav-right.open {
            max-height: 500px;
            border-bottom: 1px solid var(--border-color);
          }

          .nav-menu {
            flex-direction: column;
            gap: 0.5rem;
            width: 100%;
          }

          .nav-link {
            width: 100%;
            justify-content: flex-start;
          }

          .nav-actions {
            width: 100%;
            flex-direction: column;
            gap: 1rem;
          }

          .user-menu {
            width: 100%;
            flex-direction: column;
            gap: 0.5rem;
          }

          .user-menu .btn {
            width: 100%;
          }
        }
      `}</style>
    </nav>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // OAuth callback should work even without user logged in
  if (window.location.pathname === '/oauth/callback') {
    return <OAuthCallback />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <>
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gmail" element={<GmailAnalyzer />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
      <footer className="footer">
        <p>&copy; 2024 Intelligent Email Threat Analyzer. All rights reserved.</p>
      </footer>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app">
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
