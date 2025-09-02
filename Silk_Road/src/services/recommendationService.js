// src/services/recommendationService.js
import authService from './authService';
import { API_BASE_URL } from '../config';



class RecommendationService {
  // Get personalized recommendations for the current user
  async getForYouRecommendations(limit = 8) {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return [];
      }

      const customerId = currentUser.customer_id || currentUser.id;
      const response = await fetch(`${API_BASE_URL}/products/for_you/${customerId}?limit=${limit}`);
      
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error fetching for you recommendations:', error);
      return [];
    }
  }

  // Get frequently bought together products
  async getFrequentlyBoughtTogether(productId, limit = 4) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${productId}/frequently-bought-together?limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching frequently bought together:', error);
      return [];
    }
  }

  // Get similar products
  async getSimilarProducts(productId, limit = 4) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${productId}/similar?limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching similar products:', error);
      return [];
    }
  }

  // Get customer recommendations
  async getCustomerRecommendations(customerId, limit = 12) {
    try {
      const token = authService.getToken();
      const res = await fetch(`${API_BASE_URL}/products/recommendations/customer/${customerId}?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching customer recommendations:', error);
      return [];
    }
  }

  // Get guest recommendations
  async getGuestRecommendations(limit = 12) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/recommendations/guest?limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching guest recommendations:', error);
      return [];
    }
  }

  // Track search query
  async trackSearchQuery(query, customerId, hasResults = true) {
    try {
      const formData = new FormData();
      formData.append('query', query);
      formData.append('customer_id', customerId);
      formData.append('has_results', hasResults);

      const res = await fetch(`${API_BASE_URL}/products/search/track`, {
        method: 'POST',
        body: formData,
      });
      return res.ok;
    } catch (error) {
      console.error('Error tracking search query:', error);
      return false;
    }
  }

  // Get search analytics (admin only)
  async getSearchAnalytics(days = 30) {
    try {
      const token = authService.getToken();
      const res = await fetch(`${API_BASE_URL}/products/search/analytics?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        return data.data || {};
      }
      return {};
    } catch (error) {
      console.error('Error fetching search analytics:', error);
      return {};
    }
  }

  // Get unmatched searches (admin only)
  async getUnmatchedSearches(limit = 20) {
    try {
      const token = authService.getToken();
      const res = await fetch(`${API_BASE_URL}/products/search/unmatched?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching unmatched searches:', error);
      return [];
    }
  }

  // Get recommendations based on user type
  async getRecommendations(user = null, limit = 8) {
    if (user && user.customer_id) {
      return await this.getCustomerRecommendations(user.customer_id, limit);
    } else {
      return await this.getGuestRecommendations(limit);
    }
  }

  // Get recommendations within a price range for a specific product
  async getPriceRangeRecommendations(productId, limit = 8) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/recommendations/price-range?limit=${limit}`
      );
      
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error fetching price range recommendations:', error);
      return [];
    }
  }

  // Get recommendations from the same category as a specific product
  async getCategoryRecommendations(productId, limit = 8) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/recommendations/category?limit=${limit}`
      );
      
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error fetching category recommendations:', error);
      return [];
    }
  }

  // Get trending recommendations
  async getTrendingRecommendations(limit = 8) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/recommendations/trending?limit=${limit}`);
      
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error fetching trending recommendations:', error);
      return [];
    }
  }

  // Get trending products
  async getTrendingProducts(limit = 12) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/trending?limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching trending products:', error);
      return [];
    }
  }

  // Get smart recommendations based on current product context
  async getSmartRecommendations(currentProduct = null, limit = 8) {
    try {
      if (!currentProduct) {
        // If no current product, return trending recommendations
        return await this.getTrendingRecommendations(limit);
      }

      // Get similar products first
      const similarProducts = await this.getSimilarProducts(currentProduct.id, limit);
      
      if (similarProducts.length >= limit) {
        return similarProducts;
      }

      // If not enough similar products, supplement with category recommendations
      if (currentProduct.tags && currentProduct.tags.length > 0) {
        const categoryProducts = await this.getCategoryRecommendations(
          currentProduct.tags[0], 
          limit - similarProducts.length
        );
        
        // Combine and remove duplicates
        const combined = [...similarProducts];
        const existingIds = new Set(similarProducts.map(p => p.id));
        
        for (const product of categoryProducts) {
          if (!existingIds.has(product.id)) {
            combined.push(product);
            if (combined.length >= limit) break;
          }
        }
        
        return combined;
      }

      // Fallback to trending recommendations
      return await this.getTrendingRecommendations(limit);
    } catch (error) {
      console.error('Error fetching smart recommendations:', error);
      return [];
    }
  }

  // Get recommendations based on user's current cart
  async getCartBasedRecommendations(limit = 8) {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return await this.getTrendingRecommendations(limit);
      }

      // Get user's cart items and find similar products
      const customerId = currentUser.customer_id || currentUser.id;
      const cartResponse = await fetch(`${API_BASE_URL}/carts/customer/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      });

      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        const cartItems = cartData.data?.items || [];

        if (cartItems.length === 0) {
          return await this.getTrendingRecommendations(limit);
        }

        // Get recommendations based on the first cart item
        const firstItem = cartItems[0];
        return await this.getSimilarProducts(firstItem.product_id, limit);
      }

      return await this.getTrendingRecommendations(limit);
    } catch (error) {
      console.error('Error fetching cart-based recommendations:', error);
      return await this.getTrendingRecommendations(limit);
    }
  }

  // Get recommendations based on user's wishlist
  async getWishlistBasedRecommendations(limit = 8) {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return await this.getTrendingRecommendations(limit);
      }

      // Get user's wishlist items and find similar products
      const customerId = currentUser.customer_id || currentUser.id;
      const wishlistResponse = await fetch(`${API_BASE_URL}/wishlists/customer/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      });

      if (wishlistResponse.ok) {
        const wishlistData = await wishlistResponse.json();
        const wishlistItems = wishlistData.data?.items || [];

        if (wishlistItems.length === 0) {
          return await this.getTrendingRecommendations(limit);
        }

        // Get recommendations based on the first wishlist item
        const firstItem = wishlistItems[0];
        return await this.getSimilarProducts(firstItem.product_id, limit);
      }

      return await this.getTrendingRecommendations(limit);
    } catch (error) {
      console.error('Error fetching wishlist-based recommendations:', error);
      return await this.getTrendingRecommendations(limit);
    }
  }
}

export default new RecommendationService(); 