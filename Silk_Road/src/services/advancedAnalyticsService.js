// src/services/advancedAnalyticsService.js
import authService from './authService';

const API_BASE_URL = 'http://localhost:8000/api/v1';

class AdvancedAnalyticsService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }



    async makeRequest(endpoint, options = {}) {
        const token = authService.getToken();
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Advanced Analytics API Error (${endpoint}):`, error);
            throw error;
        }
    }

    // Geographic Analytics
    async getGeographicAnalytics() {
        return this.makeRequest('/advanced-analytics/geographic');
    }

    // Product Analytics
    async getProductAnalytics() {
        return this.makeRequest('/advanced-analytics/product');
    }

    // Marketing Analytics
    async getMarketingAnalytics() {
        return this.makeRequest('/advanced-analytics/marketing');
    }

    // Customer Analytics
    async getCustomerAnalytics() {
        return this.makeRequest('/advanced-analytics/customer');
    }

    // Predictive Analytics
    async getPredictiveAnalytics() {
        return this.makeRequest('/advanced-analytics/predictive');
    }

    // Real-time Analytics
    async getRealTimeAnalytics() {
        return this.makeRequest('/advanced-analytics/real-time');
    }

    // Comprehensive Dashboard
    async getAdvancedDashboard() {
        return this.makeRequest('/advanced-analytics/dashboard');
    }

    // Analytics Summary
    async getAnalyticsSummary() {
        return this.makeRequest('/advanced-analytics/summary');
    }

    // Event Tracking
    async trackEvent(eventType, eventData, userId = null, customerId = null, productId = null, orderId = null) {
        return this.makeRequest('/advanced-analytics/track-event', {
            method: 'POST',
            body: JSON.stringify({
                event_type: eventType,
                event_data: eventData,
                user_id: userId,
                customer_id: customerId,
                product_id: productId,
                order_id: orderId
            })
        });
    }

    // Product View Tracking
    async trackProductView(productId, userId = null, customerId = null) {
        return this.trackEvent('product_view', { product_id: productId }, userId, customerId, productId);
    }

    // Product Click Tracking
    async trackProductClick(productId, userId = null, customerId = null) {
        return this.trackEvent('product_click', { product_id: productId }, userId, customerId, productId);
    }

    // Add to Cart Tracking
    async trackAddToCart(productId, quantity, userId = null, customerId = null) {
        return this.trackEvent('add_to_cart', { 
            product_id: productId, 
            quantity: quantity 
        }, userId, customerId, productId);
    }

    // Purchase Tracking
    async trackPurchase(orderId, productId, quantity, amount, userId = null, customerId = null) {
        return this.trackEvent('purchase', { 
            order_id: orderId,
            product_id: productId, 
            quantity: quantity,
            amount: amount
        }, userId, customerId, productId, orderId);
    }

    // Page View Tracking
    async trackPageView(page, userId = null, customerId = null) {
        return this.trackEvent('page_view', { 
            page: page,
            timestamp: new Date().toISOString()
        }, userId, customerId);
    }

    // Search Tracking
    async trackSearch(query, results, userId = null, customerId = null) {
        return this.trackEvent('search', { 
            query: query,
            results_count: results.length,
            timestamp: new Date().toISOString()
        }, userId, customerId);
    }

    // Custom Event Tracking
    async trackCustomEvent(eventName, eventData, userId = null, customerId = null) {
        return this.trackEvent(eventName, eventData, userId, customerId);
    }

    // Get Analytics Data with Caching
    async getCachedAnalytics(endpoint, cacheKey, cacheDuration = 5 * 60 * 1000) { // 5 minutes default
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < cacheDuration) {
                return data;
            }
        }

        const response = await this.makeRequest(endpoint);
        const cacheData = {
            data: response,
            timestamp: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        return response;
    }

    // Clear Analytics Cache
    clearCache() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('analytics_cache_')) {
                localStorage.removeItem(key);
            }
        });
    }

    // Get Cached Geographic Analytics
    async getCachedGeographicAnalytics() {
        return this.getCachedAnalytics('/advanced-analytics/geographic', 'analytics_cache_geographic');
    }

    // Get Cached Product Analytics
    async getCachedProductAnalytics() {
        return this.getCachedAnalytics('/advanced-analytics/product', 'analytics_cache_product');
    }

    // Get Cached Marketing Analytics
    async getCachedMarketingAnalytics() {
        return this.getCachedAnalytics('/advanced-analytics/marketing', 'analytics_cache_marketing');
    }

    // Get Cached Customer Analytics
    async getCachedCustomerAnalytics() {
        return this.getCachedAnalytics('/advanced-analytics/customer', 'analytics_cache_customer');
    }

    // Get Cached Predictive Analytics
    async getCachedPredictiveAnalytics() {
        return this.getCachedAnalytics('/advanced-analytics/predictive', 'analytics_cache_predictive');
    }

    // Get Cached Real-time Analytics
    async getCachedRealTimeAnalytics() {
        return this.getCachedAnalytics('/advanced-analytics/real-time', 'analytics_cache_realtime', 30 * 1000); // 30 seconds
    }

    // Get Cached Dashboard
    async getCachedAdvancedDashboard() {
        return this.getCachedAnalytics('/advanced-analytics/dashboard', 'analytics_cache_dashboard');
    }

    // Get Cached Summary
    async getCachedAnalyticsSummary() {
        return this.getCachedAnalytics('/advanced-analytics/summary', 'analytics_cache_summary');
    }
}

// Create and export a singleton instance
const advancedAnalyticsService = new AdvancedAnalyticsService();
export default advancedAnalyticsService; 