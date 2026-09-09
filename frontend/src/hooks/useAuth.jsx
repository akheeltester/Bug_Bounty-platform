import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = sessionStorage.getItem('token');
        const storedUser = sessionStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);

          try {
            const res = await api.get('/auth/me', { timeout: 5000 });
            const freshUser = res.data;

            setUser(freshUser);
            sessionStorage.setItem('user', JSON.stringify(freshUser));
          } catch (err) {
            // Token validation failed - clear session
            console.warn('Auth token validation failed:', err.message);
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        // Catch any unexpected errors
        console.error('Auth initialization error:', err);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        // ALWAYS set loading to false
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (newToken, userData) => {
    sessionStorage.setItem('token', newToken);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
