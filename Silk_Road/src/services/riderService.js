import authService from './authService';

const API_BASE_URL = 'http://localhost:8000/api/v1';

class RiderService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthHeaders() {
    const token = authService.getToken();
    console.log('Auth token:', token ? 'Token exists' : 'No token found');
    console.log('User authenticated:', authService.isAuthenticated());
    
    if (!token) {
      console.error('No authentication token found. User may not be logged in.');
    }
    
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
  }

  async getAllRiders() {
    try {
      const response = await fetch(`${this.baseURL}/admin/riders`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching riders:', error);
      throw error;
    }
  }

  async getActiveRiders() {
    try {
      const response = await fetch(`${this.baseURL}/admin/riders/active`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching active riders:', error);
      throw error;
    }
  }

  async getRidersByZone(zone) {
    try {
      const response = await fetch(`${this.baseURL}/admin/riders/zone/${zone}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching riders by zone:', error);
      throw error;
    }
  }

  async getRiderById(riderId) {
    try {
      const response = await fetch(`${this.baseURL}/riders/${riderId}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching rider:', error);
      throw error;
    }
  }

  async updateRider(riderId, updateData) {
    try {
      const response = await fetch(`${this.baseURL}/riders/${riderId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating rider:', error);
      throw error;
    }
  }

  async activateRider(riderId) {
    try {
      const response = await fetch(`${this.baseURL}/riders/${riderId}/activate`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error activating rider:', error);
      throw error;
    }
  }

  async deactivateRider(riderId) {
    try {
      const response = await fetch(`${this.baseURL}/riders/${riderId}/deactivate`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deactivating rider:', error);
      throw error;
    }
  }

  async getRiderDeliveries() {
    try {
      const response = await fetch(`${this.baseURL}/riders/deliveries`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.detail || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching rider deliveries:', error);
      throw error;
    }
  }

  async getRiderDeliveriesById(riderId) {
    try {
      const response = await fetch(`${this.baseURL}/riders/${riderId}/deliveries`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.detail || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching rider deliveries by ID:', error);
      throw error;
    }
  }

  async getAllAssignments() {
    try {
      const response = await fetch(`${this.baseURL}/riders/assignments`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.detail || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw error;
    }
  }

  async updateAssignment(assignmentId, updateData) {
    try {
      const response = await fetch(`${this.baseURL}/riders/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.detail || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  }

  async deleteAssignment(assignmentId) {
    try {
      const response = await fetch(`${this.baseURL}/riders/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.detail || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  }

  async getActiveAssignments() {
    try {
      const response = await fetch(`${this.baseURL}/riders/assignments/active`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching active assignments:', error);
      throw error;
    }
  }

  async getAssignmentById(assignmentId) {
    try {
      const response = await fetch(`${this.baseURL}/riders/assignments/${assignmentId}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching assignment:', error);
      throw error;
    }
  }

  async updateAssignment(assignmentId, updateData) {
    try {
      const response = await fetch(`${this.baseURL}/riders/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  }

  async assignDelivery(assignmentData) {
    try {
      const response = await fetch(`${this.baseURL}/riders/assign`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(assignmentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.detail || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error assigning delivery:', error);
      throw error;
    }
  }

  async deleteAssignment(assignmentId) {
    try {
      const response = await fetch(`${this.baseURL}/riders/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  }

  // Rider profile methods
  async getRiderProfile() {
    try {
      const response = await fetch(`${this.baseURL}/riders/profile`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching rider profile:', error);
      throw error;
    }
  }

  async updateRiderProfile(updateData) {
    try {
      const response = await fetch(`${this.baseURL}/riders/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating rider profile:', error);
      throw error;
    }
  }

  async acceptDelivery(assignmentId, estimatedDelivery = null) {
    try {
      const response = await fetch(`${this.baseURL}/riders/deliveries/${assignmentId}/accept`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          estimated_delivery: estimatedDelivery
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.detail || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error accepting delivery:', error);
      throw error;
    }
  }

  async rejectDelivery(assignmentId, rejectionReason = null) {
    try {
      const response = await fetch(`${this.baseURL}/riders/deliveries/${assignmentId}/reject`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          rejection_reason: rejectionReason
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.detail || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error rejecting delivery:', error);
      throw error;
    }
  }

  async updateDeliveryStatus(assignmentId, status, deliveryNotes = null) {
    try {
      const response = await fetch(`${this.baseURL}/riders/deliveries/${assignmentId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          status,
          delivery_notes: deliveryNotes
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.detail || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating delivery status:', error);
      throw error;
    }
  }

  async testAuth() {
    try {
      const response = await fetch(`${this.baseURL}/riders/test-auth`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.detail || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error testing auth:', error);
      throw error;
    }
  }

  async registerAsRider(riderData) {
    try {
      // Check if user is authenticated first
      if (!authService.isAuthenticated()) {
        throw new Error('User is not authenticated. Please log in first.');
      }

      const headers = this.getAuthHeaders();
      console.log('Request headers:', headers);
      console.log('Request data:', riderData);

      const response = await fetch(`${this.baseURL}/riders/register`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(riderData),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response data:', errorData);
        
        // Handle specific error cases
        if (response.status === 404 && errorData.detail?.includes('Customer profile not found')) {
          throw new Error('Customer profile not found. Please complete your profile first in the Profile section.');
        } else if (response.status === 400 && errorData.detail?.includes('already registered')) {
          throw new Error('You are already registered as a rider.');
        } else {
          throw new Error(`HTTP ${response.status}: ${errorData.detail || response.statusText}`);
        }
      }
      
      const result = await response.json();
      console.log('Registration successful:', result);
      return result;
    } catch (error) {
      console.error('Error registering as rider:', error);
      throw error;
    }
  }

  // Helper method to get rider statistics
  async getRiderStats() {
    try {
      const [allRiders, activeRiders, allAssignments, activeAssignments] = await Promise.all([
        this.getAllRiders(),
        this.getActiveRiders(),
        this.getAllAssignments(),
        this.getActiveAssignments()
      ]);

      const totalRiders = allRiders.riders?.length || 0;
      const activeRidersCount = activeRiders.riders?.length || 0;
      const totalDeliveries = allAssignments.assignments?.length || 0;
      const pendingDeliveries = activeAssignments.assignments?.length || 0;

      // Calculate average rating
      const ridersWithRating = allRiders.riders?.filter(rider => rider.rating > 0) || [];
      const averageRating = ridersWithRating.length > 0 
        ? ridersWithRating.reduce((sum, rider) => sum + rider.rating, 0) / ridersWithRating.length 
        : 0;

      return {
        total_riders: totalRiders,
        active_riders: activeRidersCount,
        total_deliveries: totalDeliveries,
        average_rating: averageRating,
        pending_assignments: pendingDeliveries,
        deliveries_today: 0 // This would need to be calculated based on date
      };
    } catch (error) {
      console.error('Error fetching rider stats:', error);
      throw error;
    }
  }
}

export default new RiderService(); 