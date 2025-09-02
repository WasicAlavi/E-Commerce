// src/services/wishlistService.js
import authService from './authService';
import { API_BASE_URL } from '../config';



class WishlistService {
  // Get or create wishlist for current user
  async getOrCreateWishlist() {
    const currentUser = authService.getCurrentUser();
    const token = authService.getToken();
    if (!currentUser || !token) {
      throw new Error('User not authenticated');
    }

    const customerId = currentUser.customer_id || currentUser.id;
    if (!customerId) {
      throw new Error('No customer_id found for user');
    }

    // Try to get existing wishlist
    let res = await fetch(`${API_BASE_URL}/wishlists/customer/${customerId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.data) return data.data; // Wishlist object
    }

    // Create new wishlist if not found
    res = await fetch(`${API_BASE_URL}/wishlists/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ customer_id: customerId }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Failed to create wishlist:', errorText);
      throw new Error('Failed to create wishlist');
    }

    const data = await res.json();
    return data.data; // Wishlist object
  }

  // Add item to wishlist
  async addItemToWishlist(wishlistId, productId) {
    const token = authService.getToken();
    if (!token) throw new Error('User not authenticated');
    const res = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: productId }),
    });
    if (!res.ok) throw new Error('Failed to add item to wishlist');
    
    // Trigger wishlist update event
    window.dispatchEvent(new Event('wishlistUpdated'));
    
    return await res.json();
  }

  // Remove item from wishlist
  async removeItemFromWishlist(wishlistId, productId) {
    const token = authService.getToken();
    if (!token) throw new Error('User not authenticated');
    const res = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/items/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Failed to remove item from wishlist');
    
    // Trigger wishlist update event
    window.dispatchEvent(new Event('wishlistUpdated'));
    
    return await res.json();
  }

  // Get wishlist items
  async getWishlistItems(wishlistId) {
    try {
      const currentUser = authService.getCurrentUser();
      const token = authService.getToken();
      if (!currentUser || !token) {
        throw new Error('User not authenticated');
      }

      const res = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/items`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch wishlist items');
      }

      return await res.json();
    } catch (error) {
      console.error('Failed to get wishlist items:', error);
      throw error;
    }
  }

  // Get wishlist item count for badge
  async getWishlistItemCount() {
    try {
      const currentUser = authService.getCurrentUser();
      const token = authService.getToken();
      
      if (!currentUser || !token) return 0;

      const customerId = currentUser.customer_id || currentUser.id;
      
      // Try to get wishlist with items directly
      const res = await fetch(`${API_BASE_URL}/wishlists/customer/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        const wishlist = data.data;
        console.log('Wishlist data in getWishlistItemCount:', wishlist);
        
        if (wishlist && wishlist.items && Array.isArray(wishlist.items)) {
          console.log('Wishlist items array length:', wishlist.items.length);
          return wishlist.items.length;
        }
      }
      
      console.log('No wishlist items found, returning 0');
      return 0;
    } catch (error) {
      console.error('Error getting wishlist item count:', error);
      return 0;
    }
  }
}

export default new WishlistService();