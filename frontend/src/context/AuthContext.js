import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gmailConnected, setGmailConnected] = useState(false);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem('user');
    const storedGmailToken = localStorage.getItem('gmail_access_token');
    const storedGmailConnected = localStorage.getItem('gmail_connected') === 'true';

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedGmailToken && storedGmailConnected) {
      setGmailConnected(true);
    }

    setLoading(false);

    // Listen for OAuth callback messages
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'GMAIL_CONNECTED') {
        setGmailConnected(true);
        localStorage.setItem('gmail_access_token', event.data.access_token);
        localStorage.setItem('gmail_connected', 'true');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setGmailConnected(false);
    localStorage.removeItem('user');
    localStorage.removeItem('gmail_access_token');
    localStorage.removeItem('gmail_connected');
  };

  const connectGmail = () => {
    setGmailConnected(true);
  };

  const disconnectGmail = () => {
    setGmailConnected(false);
    localStorage.removeItem('gmail_access_token');
    localStorage.removeItem('gmail_connected');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        gmailConnected,
        login,
        logout,
        connectGmail,
        disconnectGmail
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
