import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from './authService.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const checkAuthStatus = () => {
            const authenticated = authService.isAuthenticated();
            const user = authService.getCurrentUser();
            setIsLoggedIn(authenticated);
            setCurrentUser(user);
        };

        checkAuthStatus();
        
        const handleStorageChange = () => {
            checkAuthStatus();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = (user) => {
        authService.login(user); // persist login
        setIsLoggedIn(true);
        setCurrentUser(user);
    };

    const logout = () => {
        authService.logout(); // clear login
        setIsLoggedIn(false);
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, currentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);