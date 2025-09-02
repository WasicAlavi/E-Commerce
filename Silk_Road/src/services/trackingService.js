import { API_BASE_URL } from '../config';

// src/services/trackingService.js

class TrackingService {
    constructor() {
        this.userAgent = navigator.userAgent;
        this.screenInfo = {
            width: screen.width,
            height: screen.height,
            colorDepth: screen.colorDepth
        };
        this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.language = navigator.language;
        this.sessionStartTime = Date.now();
        this.pageStartTime = Date.now();
        this.currentPage = null;
        this.sessionId = this.generateSessionId();
        
        // Track session start
        this.trackSessionStart();
        
        // Set up page visibility tracking
        this.setupPageVisibilityTracking();
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    setupPageVisibilityTracking() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackPageLeave();
            } else {
                this.trackPageReturn();
            }
        });
        
        // Track when user leaves the page
        window.addEventListener('beforeunload', () => {
            this.trackPageLeave();
        });
    }
    
    trackSessionStart() {
        const sessionData = {
            session_id: this.sessionId,
            session_start: new Date().toISOString(),
            ...this.getBrowserInfo(),
            ...this.getOSInfo(),
            ...this.getDeviceInfo()
        };
        
        this.sendTrackingData('session_start', sessionData);
    }
    
    trackPageLeave() {
        if (this.currentPage) {
            const timeSpent = Date.now() - this.pageStartTime;
            const sessionDuration = Date.now() - this.sessionStartTime;
            
            const leaveData = {
                session_id: this.sessionId,
                page: this.currentPage,
                time_spent: timeSpent / 1000, // Convert to seconds
                session_duration: sessionDuration / 1000, // Convert to seconds
                timestamp: new Date().toISOString(),
                ...this.getBrowserInfo(),
                ...this.getOSInfo(),
                ...this.getDeviceInfo()
            };
            
            this.sendTrackingData('page_leave', leaveData);
        }
    }
    
    trackPageReturn() {
        this.pageStartTime = Date.now();
    }

    // Get browser information
    getBrowserInfo() {
        const userAgent = this.userAgent;
        let browser = 'Unknown';
        let version = 'Unknown';

        if (userAgent.includes('Chrome')) {
            browser = 'Chrome';
            version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
        } else if (userAgent.includes('Firefox')) {
            browser = 'Firefox';
            version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
        } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            browser = 'Safari';
            version = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
        } else if (userAgent.includes('Edge')) {
            browser = 'Edge';
            version = userAgent.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
        } else if (userAgent.includes('Opera')) {
            browser = 'Opera';
            version = userAgent.match(/Opera\/(\d+)/)?.[1] || 'Unknown';
        }

        return { browser, version };
    }

    // Get operating system information
    getOSInfo() {
        const userAgent = this.userAgent;
        let os = 'Unknown';
        let version = 'Unknown';

        if (userAgent.includes('Windows')) {
            os = 'Windows';
            if (userAgent.includes('Windows NT 10.0')) version = '10';
            else if (userAgent.includes('Windows NT 6.3')) version = '8.1';
            else if (userAgent.includes('Windows NT 6.2')) version = '8';
            else if (userAgent.includes('Windows NT 6.1')) version = '7';
        } else if (userAgent.includes('Mac OS X')) {
            os = 'macOS';
            version = userAgent.match(/Mac OS X (\d+_\d+)/)?.[1]?.replace('_', '.') || 'Unknown';
        } else if (userAgent.includes('Linux')) {
            os = 'Linux';
        } else if (userAgent.includes('Android')) {
            os = 'Android';
            version = userAgent.match(/Android (\d+)/)?.[1] || 'Unknown';
        } else if (userAgent.includes('iOS')) {
            os = 'iOS';
            version = userAgent.match(/OS (\d+_\d+)/)?.[1]?.replace('_', '.') || 'Unknown';
        }

        return { os, version };
    }

    // Get device information
    getDeviceInfo() {
        const userAgent = this.userAgent;
        let deviceType = 'desktop';

        if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
            deviceType = 'mobile';
        } else if (/iPad|Android.*Tablet/i.test(userAgent)) {
            deviceType = 'tablet';
        }

        return {
            deviceType,
            screenWidth: this.screenInfo.width,
            screenHeight: this.screenInfo.height,
            colorDepth: this.screenInfo.colorDepth,
            timezone: this.timezone,
            language: this.language
        };
    }

    // Track page view
    async trackPageView(page, userId = null, customerId = null) {
        // Track page leave for previous page if exists
        if (this.currentPage && this.currentPage !== page) {
            this.trackPageLeave();
        }
        
        // Update current page and start time
        this.currentPage = page;
        this.pageStartTime = Date.now();
        
        const browserInfo = this.getBrowserInfo();
        const osInfo = this.getOSInfo();
        const deviceInfo = this.getDeviceInfo();

        const trackingData = {
            page,
            session_id: this.sessionId,
            timestamp: new Date().toISOString(),
            user_id: userId,
            customer_id: customerId,
            browser: browserInfo.browser,
            browser_version: browserInfo.version,
            operating_system: osInfo.os,
            os_version: osInfo.version,
            device_type: deviceInfo.deviceType,
            screen_width: deviceInfo.screenWidth,
            screen_height: deviceInfo.screenHeight,
            timezone: deviceInfo.timezone,
            language: deviceInfo.language,
            referrer: document.referrer || 'direct',
            url: window.location.href
        };

        try {
            // Send to backend
            await this.sendTrackingData('page_view', trackingData);
            
            // Also store in localStorage for offline tracking
            this.storeOfflineData('page_view', trackingData);
        } catch (error) {
            console.error('Error tracking page view:', error);
        }
    }

    // Track product view
    async trackProductView(productId, productName, userId = null, customerId = null) {
        const trackingData = {
            product_id: productId,
            product_name: productName,
            session_id: this.sessionId,
            timestamp: new Date().toISOString(),
            user_id: userId,
            customer_id: customerId,
            ...this.getBrowserInfo(),
            ...this.getOSInfo(),
            ...this.getDeviceInfo()
        };

        try {
            await this.sendTrackingData('product_view', trackingData);
            this.storeOfflineData('product_view', trackingData);
        } catch (error) {
            console.error('Error tracking product view:', error);
        }
    }

    // Track add to cart
    async trackAddToCart(productId, quantity, price, userId = null, customerId = null) {
        const trackingData = {
            product_id: productId,
            quantity,
            price,
            session_id: this.sessionId,
            timestamp: new Date().toISOString(),
            user_id: userId,
            customer_id: customerId,
            ...this.getBrowserInfo(),
            ...this.getOSInfo(),
            ...this.getDeviceInfo()
        };

        try {
            await this.sendTrackingData('add_to_cart', trackingData);
            this.storeOfflineData('add_to_cart', trackingData);
        } catch (error) {
            console.error('Error tracking add to cart:', error);
        }
    }

    // Track purchase
    async trackPurchase(orderId, totalAmount, items, userId = null, customerId = null) {
        const trackingData = {
            order_id: orderId,
            total_amount: totalAmount,
            items: items,
            session_id: this.sessionId,
            timestamp: new Date().toISOString(),
            user_id: userId,
            customer_id: customerId,
            ...this.getBrowserInfo(),
            ...this.getOSInfo(),
            ...this.getDeviceInfo()
        };

        try {
            await this.sendTrackingData('purchase', trackingData);
            this.storeOfflineData('purchase', trackingData);
        } catch (error) {
            console.error('Error tracking purchase:', error);
        }
    }

    // Send tracking data to backend
    async sendTrackingData(eventType, data) {
        const token = localStorage.getItem('token');
        
        const response = await fetch('${API_BASE_URL}/analytics/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` })
            },
            body: JSON.stringify({
                event_type: eventType,
                event_data: data
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    // Store data offline when network is unavailable
    storeOfflineData(eventType, data) {
        const offlineData = JSON.parse(localStorage.getItem('offline_tracking') || '[]');
        offlineData.push({
            event_type: eventType,
            event_data: data,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 100 events
        if (offlineData.length > 100) {
            offlineData.splice(0, offlineData.length - 100);
        }
        
        localStorage.setItem('offline_tracking', JSON.stringify(offlineData));
    }

    // Sync offline data when connection is restored
    async syncOfflineData() {
        const offlineData = JSON.parse(localStorage.getItem('offline_tracking') || '[]');
        
        if (offlineData.length === 0) return;

        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch('${API_BASE_URL}/analytics/sync-offline', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` })
                },
                body: JSON.stringify({ events: offlineData })
            });

            if (response.ok) {
                localStorage.removeItem('offline_tracking');
                console.log('Offline data synced successfully');
            }
        } catch (error) {
            console.error('Error syncing offline data:', error);
        }
    }

    // Initialize tracking
    init() {
        // Track initial page view
        this.trackPageView(window.location.pathname);
        
        // Set up offline sync
        window.addEventListener('online', () => {
            this.syncOfflineData();
        });
        
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.trackPageView(window.location.pathname);
            }
        });
    }
}

const trackingService = new TrackingService();
export default trackingService; 