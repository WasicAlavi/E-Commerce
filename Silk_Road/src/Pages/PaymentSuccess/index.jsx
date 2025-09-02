import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button as StyledButton } from '@mui/material';
import { FaCheckCircle, FaArrowLeft, FaHome, FaTruck, FaMapMarkerAlt, FaCreditCard } from 'react-icons/fa';
import { useAuth } from '../../AuthContext';
import { API_BASE_URL } from '../../config';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [paymentData, setPaymentData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  console.log('PaymentSuccess component rendered');
  console.log('Current search params:', Object.fromEntries(searchParams.entries()));

  useEffect(() => {
    console.log('PaymentSuccess useEffect triggered');
    
    // Check if we're coming from SSLCommerz (HTTPS to HTTP redirect)
    const isFromSSLCommerz = document.referrer.includes('sslcommerz.com') || 
                            document.referrer.includes('sandbox.sslcommerz.com');
    
    if (isFromSSLCommerz) {
      console.log('Detected redirect from SSLCommerz - handling mixed content issue');
      // Force a page reload to ensure proper state
      setTimeout(() => {
        window.location.reload();
      }, 100);
      return;
    }
    
    const order_id = searchParams.get('order_id');
    const secure_order_id = searchParams.get('secure_order_id');
    const tran_id = searchParams.get('tran_id');
    const amount = searchParams.get('amount');
    const value_a = searchParams.get('value_a'); // Order ID from SSLCommerz
    const status = searchParams.get('status');

    console.log('Payment Success - URL Parameters:', { 
      order_id, 
      secure_order_id, 
      tran_id, 
      amount, 
      value_a, 
      status 
    });

    // Use value_a (order_id from SSLCommerz) if available, otherwise use order_id
    const finalOrderId = value_a || order_id;
    
    console.log('Final order ID to use:', finalOrderId);
    console.log('All URL parameters:', Object.fromEntries(searchParams.entries()));
    
    // Check if we have the required parameters
    if (!finalOrderId || !tran_id || !amount) {
      console.log('Missing required parameters, setting error');
      setError('Invalid payment parameters. Please contact support if this persists.');
      setLoading(false);
      return;
    }

    // Check payment status
    if (status && status !== 'VALID') {
      console.log('Payment status is not valid:', status);
      setError('Payment was not successful. Please try again.');
      setLoading(false);
      return;
    }

    // Use secure order ID if available, otherwise fall back to regular order ID
    const displayOrderId = secure_order_id || finalOrderId;
    
    console.log('Setting payment data:', { 
      order_id: finalOrderId, 
      secure_order_id, 
      tran_id, 
      amount, 
      displayOrderId 
    });
    
    // Set payment data from URL parameters
    setPaymentData({ 
      order_id: finalOrderId, 
      secure_order_id, 
      tran_id, 
      amount, 
      displayOrderId 
    });
    
    // Fetch order details from backend
    fetchOrderDetails(finalOrderId);
    
    // Update order status after successful payment
    updateOrderStatus(finalOrderId, tran_id, status || 'VALID');
    
    // Clear cart after successful payment
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Ensure session is properly restored after payment redirect
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log('Token found:', !!token);
    
    // Force session restoration after payment redirect
    setTimeout(() => {
      // Trigger auth context refresh
      window.dispatchEvent(new Event('storage'));
      
      // Also trigger visibility change to restore session
      document.dispatchEvent(new Event('visibilitychange'));
      
      // Force a page focus event to restore session
      window.dispatchEvent(new Event('focus'));
      
      console.log('Session restoration events triggered');
    }, 100);
    
    setLoading(false);
    console.log('PaymentSuccess useEffect completed');
  }, [searchParams, navigate]);

    const fetchOrderDetails = async (orderId) => {
    try {
      console.log('Fetching order details for order ID:', orderId);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Try with authentication first
      let response = await fetch(`${API_BASE_URL}/orders/${orderId}/with-details`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // If that fails, try without authentication
      if (!response.ok && response.status === 401) {
        console.log('Auth failed, trying without authentication...');
        response = await fetch(`${API_BASE_URL}/orders/${orderId}/with-details`);
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log('Order data received:', data);
        setOrderData(data.data);
      } else {
        console.error('Failed to fetch order details:', response.status, response.statusText);
        // Try to get error details
        try {
          const errorText = await response.text();
          console.error('Error response:', errorText);
        } catch (e) {
          console.error('Could not read error response');
        }
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const updateOrderStatus = async (orderId, tranId, status) => {
    try {
      const formData = new FormData();
      formData.append('order_id', orderId);
      formData.append('tran_id', tranId);
      formData.append('status', status);

      const response = await fetch(`${API_BASE_URL}/payment-methods/sslcommerz/update-order-status`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        console.log('Order status updated successfully');
      } else {
        console.error('Failed to update order status:', response.status);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#EDF6E5] min-h-screen py-12 font-montserrat">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-2xl font-bold text-[#40513B]">Validating payment...</div>
            <div className="text-sm text-[#40513B] mt-2">Please wait...</div>
          </div>
        </div>
      </div>
    );
  }

  // If we have payment data, show the success page
  if (paymentData) {
    // Show success page even if order data couldn't be loaded
    const showOrderData = orderData !== null;
    return (
      <div className="bg-[#EDF6E5] min-h-screen py-12 font-montserrat">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-8">
              <FaCheckCircle size={80} className="mx-auto text-green-500 mb-4" />
              <h1 className="text-4xl font-bold text-[#40513B] mb-4">
                Payment Successful!
              </h1>
              <p className="text-lg text-[#40513B] mb-8">
                Your payment has been processed successfully. Here are your order details:
              </p>
            </div>
            
            {/* Debug Information - Remove this in production */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">Debug Info:</h3>
              <div className="text-sm text-yellow-700 space-y-1">
                <div>Order ID: {paymentData.order_id}</div>
                <div>Transaction ID: {paymentData.tran_id}</div>
                <div>Amount: ৳{paymentData.amount}</div>
                <div>Order Data Loaded: {orderData ? 'Yes' : 'No'}</div>
                <div>User: {currentUser ? 'Logged in' : 'Not logged in'}</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Payment Details */}
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h2 className="text-2xl font-bold text-[#40513B] mb-6 flex items-center gap-2">
                  <FaCreditCard className="text-[#9DC08B]" />
                  Payment Details
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-[#40513B]">Transaction ID:</span>
                    <span className="font-semibold text-[#9DC08B]">{paymentData.tran_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#40513B]">Order ID:</span>
                    <span className="font-semibold text-[#9DC08B]">{paymentData.displayOrderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#40513B]">Amount Paid:</span>
                    <span className="font-semibold text-[#9DC08B]">৳{paymentData.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#40513B]">Payment Status:</span>
                    <span className="text-green-600 font-semibold">Completed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#40513B]">Payment Method:</span>
                    <span className="font-semibold text-[#9DC08B]">SSL Commerz</span>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h2 className="text-2xl font-bold text-[#40513B] mb-6 flex items-center gap-2">
                  <FaTruck className="text-[#9DC08B]" />
                  Order Summary
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-[#40513B]">Order ID:</span>
                    <span className="font-semibold text-[#9DC08B]">{paymentData.displayOrderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#40513B]">Order Date:</span>
                    <span className="font-semibold text-[#9DC08B]">
                      {orderData ? formatDate(orderData.created_at || orderData.order_date) : 'Processing...'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#40513B]">Status:</span>
                    <span className="text-green-600 font-semibold capitalize">
                      {orderData ? (orderData.status || 'Pending') : 'Processing...'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#40513B]">Subtotal:</span>
                    <span className="font-semibold text-[#9DC08B]">
                      ৳{orderData ? (orderData.subtotal || orderData.total_price || 0) : 'Processing...'}
                    </span>
                  </div>
                  {orderData && (orderData.discount || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#40513B]">Discount:</span>
                      <span className="font-semibold text-red-500">-৳{orderData.discount || 0}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#40513B]">Shipping:</span>
                    <span className="font-semibold text-[#9DC08B]">
                      ৳{orderData ? (orderData.shipping_cost || 0) : 'Processing...'}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-[#40513B]">Total:</span>
                      <span className="text-[#9DC08B]">
                        ৳{orderData ? (orderData.total_amount || orderData.total_price || 0) : 'Processing...'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            {orderData && orderData.order_items && orderData.order_items.length > 0 ? (
              <div className="bg-white rounded-lg p-6 shadow-md mb-8">
                <h2 className="text-2xl font-bold text-[#40513B] mb-6">Order Items</h2>
                <div className="space-y-4">
                  {orderData.order_items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="product-image-container w-16 h-16">
                        <img 
                          src={item.product_image || '/placeholder-product.jpg'} 
                          alt={item.product_name || 'Product'}
                          className="w-full h-full object-cover rounded product-image-zoom"
                          onError={(e) => {
                            e.target.src = '/placeholder-product.jpg';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#40513B]">{item.product_name || 'Product'}</h3>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity || 0} × ৳{item.price || 0}
                          {item.size && ` | Size: ${item.size}`}
                          {item.color && ` | Color: ${item.color}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#9DC08B]">৳{item.total_price || (item.price * item.quantity) || 0}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6 shadow-md mb-8">
                <h2 className="text-2xl font-bold text-[#40513B] mb-6">Order Items</h2>
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Order details are being loaded...</p>
                  <p className="text-sm text-gray-500">If this persists, please check your order in your profile.</p>
                </div>
              </div>
            )}

            {/* Shipping Address */}
            {orderData && orderData.shipping_address ? (
              <div className="bg-white rounded-lg p-6 shadow-md mb-8">
                <h2 className="text-2xl font-bold text-[#40513B] mb-6 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-[#9DC08B]" />
                  Shipping Address
                </h2>
                <div className="text-[#40513B]">
                  <p className="font-semibold">{orderData.shipping_address.full_name || 'Customer'}</p>
                  <p>{orderData.shipping_address.address_line1 || ''}</p>
                  {orderData.shipping_address.address_line2 && (
                    <p>{orderData.shipping_address.address_line2}</p>
                  )}
                  <p>{orderData.shipping_address.city}, {orderData.shipping_address.state} {orderData.shipping_address.postal_code}</p>
                  {orderData.shipping_address.phone && (
                    <p>Phone: {orderData.shipping_address.phone}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6 shadow-md mb-8">
                <h2 className="text-2xl font-bold text-[#40513B] mb-6 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-[#9DC08B]" />
                  Shipping Address
                </h2>
                <div className="text-center py-4">
                  <p className="text-gray-600">Shipping address details are being loaded...</p>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-[#40513B] mb-4">What's Next?</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#9DC08B] text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-[#40513B]">Order Processing</p>
                    <p className="text-sm text-[#40513B]">We'll review and process your order within 24 hours.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#9DC08B] text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-[#40513B]">Shipping</p>
                    <p className="text-sm text-[#40513B]">Your order will be shipped within 1-2 business days.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#9DC08B] text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-[#40513B]">Delivery</p>
                    <p className="text-sm text-[#40513B]">You'll receive tracking information via email.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/profile">
                <StyledButton
                  variant="contained"
                  startIcon={<FaArrowLeft />}
                  sx={{
                    backgroundColor: '#9DC08B',
                    '&:hover': {
                      backgroundColor: '#40513B',
                    }
                  }}
                >
                  View My Orders
                </StyledButton>
              </Link>
              <Link to="/">
                <StyledButton
                  variant="outlined"
                  startIcon={<FaHome />}
                  sx={{
                    borderColor: '#9DC08B',
                    color: '#40513B',
                    '&:hover': {
                      borderColor: '#40513B',
                      backgroundColor: '#9DC08B',
                      color: 'white',
                    }
                  }}
                >
                  Continue Shopping
                </StyledButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#EDF6E5] min-h-screen py-12 font-montserrat">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-red-500 text-2xl font-bold mb-4">Payment Error</div>
            <div className="text-[#40513B] mb-8">{error}</div>
            
            {/* Debug Information */}
            <div className="bg-white rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-[#40513B] mb-2">Debug Information:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>URL Parameters: {Array.from(searchParams.entries()).map(([k,v]) => `${k}=${v}`).join(', ')}</div>
                <div>User: {currentUser ? 'Logged in' : 'Not logged in'}</div>
                <div>Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <StyledButton
                variant="contained"
                onClick={() => window.location.reload()}
                sx={{
                  backgroundColor: '#9DC08B',
                  '&:hover': {
                    backgroundColor: '#40513B',
                  }
                }}
              >
                Retry Payment
              </StyledButton>
              <Link to="/cart">
                <StyledButton
                  variant="contained"
                  startIcon={<FaArrowLeft />}
                  sx={{
                    backgroundColor: '#9DC08B',
                    '&:hover': {
                      backgroundColor: '#40513B',
                    }
                  }}
                >
                  Back to Cart
                </StyledButton>
              </Link>
              <Link to="/">
                <StyledButton
                  variant="outlined"
                  startIcon={<FaHome />}
                  sx={{
                    borderColor: '#9DC08B',
                    color: '#40513B',
                    '&:hover': {
                      borderColor: '#40513B',
                      backgroundColor: '#9DC08B',
                      color: 'white',
                    }
                  }}
                >
                  Go Home
                </StyledButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default fallback - this should never be reached, but just in case
  return (
    <div className="bg-[#EDF6E5] min-h-screen py-12 font-montserrat">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-2xl font-bold text-[#40513B]">Payment Success Page</div>
          <div className="text-sm text-[#40513B] mt-2">Something went wrong</div>
          <div className="text-sm text-[#40513B] mt-2">User: {currentUser ? 'Logged in' : 'Not logged in'}</div>
          <div className="text-sm text-[#40513B] mt-2">Loading: {loading ? 'Yes' : 'No'}</div>
          <div className="text-sm text-[#40513B] mt-2">Error: {error || 'None'}</div>
          <div className="text-sm text-[#40513B] mt-2">Payment Data: {paymentData ? 'Present' : 'None'}</div>
          <div className="mt-4">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-[#9DC08B] text-white px-4 py-2 rounded hover:bg-[#40513B]"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 