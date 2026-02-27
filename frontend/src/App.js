import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { FiHome, FiMail, FiBarChart2, FiShield } from 'react-icons/fi';
import Home from './pages/Home';
import GmailAnalysis from './pages/GmailAnalysis';
import Dashboard from './pages/Dashboard';
import Privacy from './pages/Privacy';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-brand">
              <FiShield className="logo" />
              <span>Email Threat Analyzer</span>
            </div>
            <ul className="nav-menu">
              <li>
                <Link to="/" className="nav-link">
                  <FiHome /> Home
                </Link>
              </li>
              <li>
                <Link to="/gmail" className="nav-link">
                  <FiMail /> Gmail
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="nav-link">
                  <FiBarChart2 /> Dashboard
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="nav-link">
                  <FiShield /> Privacy
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gmail" element={<GmailAnalysis />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; 2024 Intelligent Email Threat Analyzer. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
