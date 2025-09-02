import authService from './authService';

const API_BASE_URL = 'http://localhost:8000/api/v1';

class AnalyticsService {
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
      console.error(`Analytics API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Sales Dashboard Analytics
  async getSalesDashboard(days = 30) {
    return this.makeRequest(`/analytics/sales-dashboard?days=${days}`);
  }

  // Inventory Analytics
  async getInventoryAnalytics() {
    return this.makeRequest('/analytics/inventory');
  }

  // Customer Segmentation
  async getCustomerSegmentation() {
    return this.makeRequest('/analytics/customer-segmentation');
  }

  // Performance Metrics
  async getPerformanceMetrics() {
    return this.makeRequest('/analytics/performance-metrics');
  }

  // Trend Analysis
  async getTrendAnalysis() {
    return this.makeRequest('/analytics/trend-analysis');
  }

  // Comprehensive Dashboard Overview
  async getDashboardOverview() {
    return this.makeRequest('/analytics/dashboard-overview');
  }

  // Search Analytics
  async getSearchAnalytics(days = 30) {
    return this.makeRequest(`/products/search/analytics?days=${days}`);
  }
}

export default new AnalyticsService(); 