import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from './services/authService.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(authService.isAuthenticated());
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(authService.isAuthenticated());
      setCurrentUser(authService.getCurrentUser());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (user) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    authService.login(user);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    authService.logout();
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);