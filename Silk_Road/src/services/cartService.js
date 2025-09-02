// src/services/cartService.js
import authService from './authService';
import trackingService from './trackingService';
import { API_BASE_URL } from '../config';



class CartService {
  // Get or create active cart for current user
  async getOrCreateCart() {
    const currentUser = authService.getCurrentUser();
    const token = authService.getToken();
    
    if (!currentUser || !token) throw new Error('User not authenticated');

    const customerId = currentUser.customer_id || currentUser.id;
    if (!customerId) throw new Error('No customer_id found for user');

    // Try to get existing cart with items
    let res = await fetch(`${API_BASE_URL}/carts/customer/${customerId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.data) return data.data; // Cart object with items
    }

    // Create new cart if not found
    res = await fetch(`${API_BASE_URL}/carts/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ customer_id: customerId }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Failed to create cart:', errorText);
      throw new Error('Failed to create cart');
    }
    const data = await res.json();
    
    // Return cart with empty items array
    return {
      ...data.data,
      items: []
    };
  }

  // Add item to cart
  async addItemToCart(cartId, productId, quantity) {
    const token = authService.getToken();
    const payload = { cart_id: cartId, product_id: productId, quantity };
    console.log('Add to cart payload:', payload);

    const res = await fetch(`${API_BASE_URL}/carts/${cartId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Failed to add item to cart:', errorText);
      throw new Error('Failed to add item to cart');
    }

    // Track add to cart event
    const currentUser = authService.getCurrentUser();
    trackingService.trackAddToCart(
      productId,
      quantity,
      0, // Price will be updated from product data
      currentUser?.id,
      currentUser?.customer_id
    );

    // Trigger cart update event
    window.dispatchEvent(new Event('cartUpdated'));
    
    return await res.json();
  }

  // Remove item from cart
  async removeItemFromCart(cartId, itemId) {
    const currentUser = authService.getCurrentUser();
    const token = authService.getToken();
    if (!currentUser || !token) throw new Error('User not authenticated');

    const res = await fetch(`${API_BASE_URL}/carts/${cartId}/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Failed to remove item from cart');
    
    // Trigger cart update event
    window.dispatchEvent(new Event('cartUpdated'));
    
    return await res.json();
  }

  // Update item quantity
  async updateItemQuantity(cartId, itemId, quantity) {
    const currentUser = authService.getCurrentUser();
    const token = authService.getToken();
    if (!currentUser || !token) throw new Error('User not authenticated');

    const payload = { quantity };

    const res = await fetch(`${API_BASE_URL}/carts/${cartId}/items/${itemId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update item quantity');
    
    // Trigger cart update event
    window.dispatchEvent(new Event('cartUpdated'));
    
    return await res.json();
  }

  // Place order from cart
  async placeOrder(orderData, selectedAddressId) {
    const currentUser = authService.getCurrentUser();
    const token = authService.getToken();
    if (!currentUser || !token) throw new Error('User not authenticated');

    const payload = {
      customer_id: orderData.customer_id,
      total_price: orderData.total,
      address_id: selectedAddressId || currentUser.address_id || 1,
      payment_id: null, // No payment method for now
      items: orderData.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }))
    };

    console.log('Sending order payload:', payload);

    try {
      // First create the order
      const orderRes = await fetch(`${API_BASE_URL}/orders/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create order');
      }

      const orderResult = await orderRes.json();
      const orderId = orderResult.data.id;

      // Handle coupon redemption if a coupon was applied
      if (orderData.coupon && orderData.coupon.code) {
        try {
          // Get the coupon details to get the coupon ID
          const couponRes = await fetch(`${API_BASE_URL}/coupons/code/${orderData.coupon.code}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (couponRes.ok) {
            const couponData = await couponRes.json();
            const couponId = couponData.data.id;
            
            // Redeem the coupon
            await fetch(`${API_BASE_URL}/coupons/redeem`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                coupon_id: couponId,
                customer_id: orderData.customer_id,
                order_id: orderId,
                discount_amount: orderData.discount
              }),
            });
          }
        } catch (couponError) {
          console.error('Error redeeming coupon:', couponError);
          // Don't fail the order if coupon redemption fails
        }
      }

      // Track purchase event
      trackingService.trackPurchase(
        orderId,
        orderData.total,
        orderData.items,
        currentUser?.id,
        currentUser?.customer_id
      );

      // Get customer details for payment
      const customerRes = await fetch(`${API_BASE_URL}/customers/user/${currentUser.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!customerRes.ok) {
        throw new Error('Failed to get customer details');
      }
      const customerData = await customerRes.json();
      const customer = customerData.data;

      // Get address details
      const addressRes = await fetch(`${API_BASE_URL}/addresses/${selectedAddressId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!addressRes.ok) {
        throw new Error('Failed to get address details');
      }
      const addressData = await addressRes.json();
      const address = addressData;

      // Prepare payment data for SSL Commerz
      const paymentData = {
        order_id: orderId,
        total_amount: orderData.total,
        customer_id: customer.id,
        customer_name: `${customer.first_name} ${customer.last_name}`,
        customer_email: currentUser.email,
        customer_address: address.street,
        customer_city: address.city,
        customer_postcode: address.postal_code,
        customer_phone: customer.phone || 'N/A',
        items: orderData.items,
        product_name: orderData.items.map(item => item.name).join(', ')
      };

      console.log('Sending paymentData to backend:', paymentData);
      console.log('Making POST request to:', `${API_BASE_URL}/payment-methods/sslcommerz/create-session`);

      // Create SSL Commerz payment session with cache-busting
      const timestamp = Date.now();
      const requestUrl = `${API_BASE_URL}/payment-methods/sslcommerz/create-session?_t=${timestamp}`;
      const requestOptions = {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(paymentData),
      };
      
      console.log('Request URL:', requestUrl);
      console.log('Request method:', requestOptions.method);
      console.log('Request headers:', requestOptions.headers);
      console.log('Request body:', requestOptions.body);
      
      const paymentRes = await fetch(requestUrl, requestOptions);

      console.log('Payment response status:', paymentRes.status);
      console.log('Payment response headers:', Object.fromEntries(paymentRes.headers.entries()));

      const paymentResult = await paymentRes.clone().json().catch((error) => {
        console.error('Error parsing payment response:', error);
        return null;
      });
      console.log('Payment session response:', paymentResult);

      if (!paymentRes.ok) {
        throw new Error('Failed to create payment session');
      }

      if (paymentResult && paymentResult.success) {
        // Redirect to SSL Commerz payment gateway
        window.location.href = paymentResult.data.gateway_page_url;
        return { success: true, redirect: true };
      } else {
        throw new Error(paymentResult?.error || 'Payment session creation failed');
      }

    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  }

  // Get cart item count for badge
  async getCartItemCount() {
    try {
      const currentUser = authService.getCurrentUser();
      const token = authService.getToken();
      
      if (!currentUser || !token) return 0;

      const customerId = currentUser.customer_id || currentUser.id;
      
      // Try to get cart with items directly
      const res = await fetch(`${API_BASE_URL}/carts/customer/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        const cart = data.data;
        console.log('Cart data in getCartItemCount:', cart);
        
        if (cart && cart.items && Array.isArray(cart.items)) {
          console.log('Cart items array length:', cart.items.length);
          return cart.items.length;
        }
      }
      
      console.log('No cart items found, returning 0');
      return 0;
    } catch (error) {
      console.error('Error getting cart item count:', error);
      return 0;
    }
  }
}

export default new CartService();