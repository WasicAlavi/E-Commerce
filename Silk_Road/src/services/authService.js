// Basic authentication service for localStorage-based auth

const AUTH_KEY = 'authUser';

const authService = {
    // Accepts a user object, which should include id and/or customer_id
    login(user) {
        // If user does not have id/customer_id, you should fetch it from backend after login
        // For now, just store whatever is passed in
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        return { success: true, user };
    },
    logout() {
        localStorage.removeItem(AUTH_KEY);
    },
    isAuthenticated() {
        return !!localStorage.getItem(AUTH_KEY);
    },
    getCurrentUser() {
        const user = localStorage.getItem(AUTH_KEY);
        return user ? JSON.parse(user) : null;
    }
};

export default authService; 