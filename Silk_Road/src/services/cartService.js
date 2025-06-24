// src/services/cartService.js
import authService from './authService';

const API_BASE_URL = 'http://localhost:8000/api/v1';

class CartService {
  // Get or create active cart for current user
  async getOrCreateCart() {
    const currentUser = authService.getCurrentUser();
    console.log('Current user:', currentUser);

    if (!currentUser) throw new Error('User not authenticated');

    const customerId = currentUser.customer_id || currentUser.id;
    if (!customerId) throw new Error('No customer_id found for user');

    // Try to get existing cart
    let res = await fetch(`${API_BASE_URL}/carts/customer/${customerId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.data) return data.data; // Cart object
    }

    // Create new cart if not found
    res = await fetch(`${API_BASE_URL}/carts/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: customerId }),
    });
    if (!res.ok) throw new Error('Failed to create cart');
    const data = await res.json();
    return data.data; // Cart object
  }

  // Add item to cart
  async addItemToCart(cartId, productId, quantity) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('User not authenticated');

    const payload = {
      cart_id: cartId,
      product_id: productId,
      quantity,
    };

    const res = await fetch(`${API_BASE_URL}/carts/${cartId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to add item to cart');
    return await res.json();
  }
}

export default new CartService();