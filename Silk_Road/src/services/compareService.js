// Compare products service
const API_BASE_URL = 'http://localhost:8000/api/v1';

class CompareService {
  static MAX_COMPARE_ITEMS = 3;

  /**
   * Get products for comparison
   * @param {Array<number>} productIds - Array of product IDs to compare
   * @returns {Promise<Array>} Array of products with comparison data
   */
  static async getProductsForCompare(productIds) {
    try {
      if (!productIds || productIds.length === 0) {
        return [];
      }

      const idsParam = productIds.join(',');
      const response = await fetch(`${API_BASE_URL}/products/compare?product_ids=${idsParam}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const products = await response.json();
      return products;
    } catch (error) {
      console.error('Error fetching products for comparison:', error);
      throw error;
    }
  }

  /**
   * Add product to compare list (stored in localStorage)
   * @param {number} productId - Product ID to add
   * @returns {Object} Result object with success status and message
   */
  static addToCompare(productId) {
    try {
      const compareList = this.getCompareList();
      
      // Check if product is already in the list
      if (compareList.includes(productId)) {
        return {
          success: false,
          message: 'Product is already in your compare list'
        };
      }
      
      // Check if list is full
      if (compareList.length >= this.MAX_COMPARE_ITEMS) {
        return {
          success: false,
          message: `You can only compare up to ${this.MAX_COMPARE_ITEMS} products. Please remove an item first.`
        };
      }
      
      // Add product to list
      compareList.push(productId);
      localStorage.setItem('compareList', JSON.stringify(compareList));
      
      // Dispatch event to update header badge
      window.dispatchEvent(new CustomEvent('compareUpdated'));
      
      return {
        success: true,
        message: `Product added to compare list (${compareList.length}/${this.MAX_COMPARE_ITEMS})`
      };
    } catch (error) {
      console.error('Error adding product to compare list:', error);
      return {
        success: false,
        message: 'Failed to add product to compare list'
      };
    }
  }

  /**
   * Remove product from compare list
   * @param {number} productId - Product ID to remove
   * @returns {Object} Result object with success status and message
   */
  static removeFromCompare(productId) {
    try {
      const compareList = this.getCompareList();
      const updatedList = compareList.filter(id => id !== productId);
      localStorage.setItem('compareList', JSON.stringify(updatedList));
      
      // Dispatch event to update header badge
      window.dispatchEvent(new CustomEvent('compareUpdated'));
      
      return {
        success: true,
        message: `Product removed from compare list (${updatedList.length}/${this.MAX_COMPARE_ITEMS})`
      };
    } catch (error) {
      console.error('Error removing product from compare list:', error);
      return {
        success: false,
        message: 'Failed to remove product from compare list'
      };
    }
  }

  /**
   * Get current compare list from localStorage
   * @returns {Array<number>} Array of product IDs
   */
  static getCompareList() {
    try {
      const stored = localStorage.getItem('compareList');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting compare list:', error);
      return [];
    }
  }

  /**
   * Clear compare list
   * @returns {Object} Result object with success status and message
   */
  static clearCompareList() {
    try {
      localStorage.removeItem('compareList');
      
      // Dispatch event to update header badge
      window.dispatchEvent(new CustomEvent('compareUpdated'));
      
      return {
        success: true,
        message: 'Compare list cleared'
      };
    } catch (error) {
      console.error('Error clearing compare list:', error);
      return {
        success: false,
        message: 'Failed to clear compare list'
      };
    }
  }

  /**
   * Check if product is in compare list
   * @param {number} productId - Product ID to check
   * @returns {boolean} True if product is in compare list
   */
  static isInCompareList(productId) {
    const compareList = this.getCompareList();
    return compareList.includes(productId);
  }

  /**
   * Get compare list count
   * @returns {number} Number of products in compare list
   */
  static getCompareListCount() {
    return this.getCompareList().length;
  }

  /**
   * Check if compare list is full
   * @returns {boolean} True if compare list is at maximum capacity
   */
  static isCompareListFull() {
    return this.getCompareListCount() >= this.MAX_COMPARE_ITEMS;
  }

  /**
   * Get remaining slots in compare list
   * @returns {number} Number of remaining slots
   */
  static getRemainingSlots() {
    return Math.max(0, this.MAX_COMPARE_ITEMS - this.getCompareListCount());
  }

  /**
   * Get products for comparison page
   * @returns {Promise<Array>} Array of products with full comparison data
   */
  static async getCompareProducts() {
    try {
      const compareList = this.getCompareList();
      if (compareList.length === 0) {
        return [];
      }
      
      return await this.getProductsForCompare(compareList);
    } catch (error) {
      console.error('Error getting compare products:', error);
      return [];
    }
  }
}

export default CompareService; 