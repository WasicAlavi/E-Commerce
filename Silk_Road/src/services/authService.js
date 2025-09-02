// authentication service

import axios from 'axios';
import Cookies from 'js-cookie';

const AUTH_KEY = 'authUser';
const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const API_BASE_URL = 'http://localhost:8000/api/v1';

const authService = {
    // Register new user
    async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Registration failed');
            }

            // If registration is successful, automatically log in the user
            if (data) {
                this.storeUser(data);
            }

            return { success: true, user: data, message: 'Registration successful' };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        }
    },

    // Login user
    async login(credentials) {
        try {
            // Use the correct login endpoint
            const response = await axios.post(`${API_BASE_URL}/users/login`, { username: credentials.username, password: credentials.password });
            
            if (response.data.access_token) {
                const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
                Cookies.set(TOKEN_KEY, response.data.access_token, { 
                    expires: 7, 
                    secure: !isLocalhost, // Only secure on non-localhost
                    sameSite: 'lax' // Changed from 'strict' to 'lax' for better compatibility
                });
                Cookies.set(USER_KEY, JSON.stringify(response.data.user), { 
                    expires: 7, 
                    secure: !isLocalhost, 
                    sameSite: 'lax' 
                });
                Cookies.set(AUTH_KEY, JSON.stringify(response.data.user), { 
                    expires: 7, 
                    secure: !isLocalhost, 
                    sameSite: 'lax' 
                });
                
                // Backup token storage for better session persistence
                try {
                    localStorage.setItem('token_backup', response.data.access_token);
                    localStorage.setItem('user_backup', JSON.stringify(response.data.user));
                } catch (e) {
                    console.warn('Could not store backup token in localStorage:', e);
                }
                
                return { success: true, user: response.data.user, token: response.data.access_token };
            }
            return { success: false, error: 'No token received' };
        } catch (error) {
            return { success: false, error: error.response?.data?.detail || 'Login failed' };
        }
    },

    // Store user data in cookies (internal method)
    storeUser(user) {
        Cookies.set(AUTH_KEY, JSON.stringify(user), { expires: 7, secure: true, sameSite: 'strict' });
    },

    async logout() {
        try {
            const token = this.getToken();
            if (token && this.isAuthenticated()) {
                // Only call backend logout if token is valid
                await axios.post(`${API_BASE_URL}/users/logout`, {}, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Always clear all storage
            this.clearAllStorage();
        }
    },
    isAuthenticated() {
        const token = Cookies.get(TOKEN_KEY);
        if (!token) {
            // Try to recover from backup storage
            try {
                const backupToken = localStorage.getItem('token_backup');
                if (backupToken) {
                    // Validate backup token
                    const payload = JSON.parse(atob(backupToken.split('.')[1]));
                    const currentTime = Date.now() / 1000;
                    if (payload.exp < currentTime) {
                        // Backup token is also expired, clear everything
                        this.clearAllStorage();
                        return false;
                    }
                    // Restore valid backup token
                    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
                    Cookies.set(TOKEN_KEY, backupToken, { 
                        expires: 7, 
                        secure: !isLocalhost, 
                        sameSite: 'lax' 
                    });
                    return true;
                }
            } catch (e) {
                console.warn('Could not recover token from backup storage:', e);
            }
            return false;
        }
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            if (payload.exp < currentTime) {
                // Token is expired, clear it without calling logout
                this.clearAllStorage();
                return false;
            }
            return true;
        } catch (error) {
            console.error('Token parse error:', error);
            // Invalid token, clear it without calling logout
            this.clearAllStorage();
            return false;
        }
    },

    clearAllStorage() {
        // Clear all authentication data
        Cookies.remove(TOKEN_KEY);
        Cookies.remove(USER_KEY);
        Cookies.remove(AUTH_KEY);
        
        // Clear backup storage
        try {
            localStorage.removeItem('token_backup');
            localStorage.removeItem('user_backup');
        } catch (e) {
            console.warn('Could not clear backup storage:', e);
        }
    },

    getToken() {
        let token = Cookies.get(TOKEN_KEY);
        
        // If token is not in cookies, try to recover from backup storage
        if (!token) {
            try {
                token = localStorage.getItem('token_backup');
                if (token) {
                    // Restore token to cookies
                    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
                    Cookies.set(TOKEN_KEY, token, { 
                        expires: 7, 
                        secure: !isLocalhost, 
                        sameSite: 'lax' 
                    });
                }
            } catch (e) {
                console.warn('Could not recover token from backup storage:', e);
            }
        }
        
        return token;
    },
    
    getCurrentUser() {
        let user = Cookies.get(USER_KEY);
        
        // If user is not in cookies, try to recover from backup storage
        if (!user) {
            try {
                const userBackup = localStorage.getItem('user_backup');
                if (userBackup) {
                    user = userBackup;
                    // Restore user to cookies
                    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
                    Cookies.set(USER_KEY, user, { 
                        expires: 7, 
                        secure: !isLocalhost, 
                        sameSite: 'lax' 
                    });
                }
            } catch (e) {
                console.warn('Could not recover user from backup storage:', e);
            }
        }
        
        return user ? JSON.parse(user) : null;
    }
};

export default authService; 