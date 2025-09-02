import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from './services/authService.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [token, setToken] = useState(authService.getToken());

  useEffect(() => {
    // Check if token is valid on app startup
    if (authService.isAuthenticated()) {
      console.log('Token is valid, setting user and token');
      console.log('Current user:', authService.getCurrentUser());
      console.log('Current token:', authService.getToken());
      setUser(authService.getCurrentUser());
      setToken(authService.getToken());
    } else {
      // Clear invalid tokens without calling logout
      setUser(null);
      setToken(null);
    }
    
    const handleStorageChange = () => {
      if (authService.isAuthenticated()) {
        setUser(authService.getCurrentUser());
        setToken(authService.getToken());
      } else {
        setUser(null);
        setToken(null);
      }
    };
    
    const handleVisibilityChange = () => {
      // Re-check authentication when page becomes visible (after payment redirect)
      if (!document.hidden) {
        console.log('Page became visible, checking authentication...');
        if (authService.isAuthenticated()) {
          console.log('User is still authenticated, restoring session...');
          setUser(authService.getCurrentUser());
          setToken(authService.getToken());
        } else {
          console.log('User is not authenticated after visibility change');
        }
      }
    };

    // Auto logout functionality - check token expiration every minute
    const checkTokenExpiration = () => {
      if (!authService.isAuthenticated()) {
        console.log('Token expired, auto logging out');
        setUser(null);
        setToken(null);
      }
    };

    // Check token expiration every minute
    const tokenCheckInterval = setInterval(checkTokenExpiration, 60000); // 1 minute
    
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(tokenCheckInterval);
    };
  }, []);

  const login = (userObj, token) => {
    setUser(userObj);
    setToken(token);
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await authService.logout();
  };

  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);