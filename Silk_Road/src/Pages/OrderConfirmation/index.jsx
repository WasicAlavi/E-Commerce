import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button as StyledButton } from '@mui/material';
import { FaCheckCircle, FaArrowLeft, FaHome, FaTruck, FaMapMarkerAlt, FaCreditCard } from 'react-icons/fa';
import { useAuth } from '../../AuthContext';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get order data from navigation state or URL params
    const orderId = location.state?.orderId || new URLSearchParams(location.search).get('orderId');
    
    if (orderId) {
      // Fetch order details from backend
      fetchOrderDetails(orderId);
    } else {
      // If no order ID, redirect to home
      navigate('/');
    }
  }, [location, navigate]);

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/orders/${orderId}/with-details`);
      if (response.ok) {
        const data = await response.json();
        console.log('Order data received:', data);
        console.log('Order data structure:', data.data);
        setOrderData(data.data);
      } else {
        console.error('Failed to fetch order details');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      navigate('/');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="bg-[#EDF6E5] min-h-screen py-12 font-montserrat">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-2xl font-bold text-[#40513B]">Loading order details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="bg-[#EDF6E5] min-h-screen py-12 font-montserrat">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-2xl font-bold text-[#40513B]">Order not found</div>
            <Link to="/" className="text-[#9DC08B] hover:text-[#40513B]">
              Return to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#EDF6E5] min-h-screen py-12 font-montserrat">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <FaCheckCircle size={80} className="mx-auto text-green-500 mb-4" />
            <h1 className="text-4xl font-bold text-[#40513B] mb-4">
              Order Placed Successfully!
            </h1>
            <p className="text-lg text-[#40513B] mb-8">
              Thank you for your purchase. Your order has been confirmed and will be processed shortly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-bold text-[#40513B] mb-6 flex items-center gap-2">
                <FaTruck className="text-[#9DC08B]" />
                Order Summary
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-[#40513B]">Order ID:</span>
                  <span className="font-semibold text-[#9DC08B]">{orderData.secure_order_id || orderData.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#40513B]">Order Date:</span>
                  <span className="font-semibold text-[#9DC08B]">{formatDate(orderData.created_at || orderData.order_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#40513B]">Status:</span>
                  <span className="text-green-600 font-semibold capitalize">{orderData.status || 'Pending'}</span>
                </div>
                {orderData.transaction_id && (
                  <div className="flex justify-between">
                    <span className="text-[#40513B]">Transaction ID:</span>
                    <span className="font-semibold text-[#9DC08B]">{orderData.transaction_id}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#40513B]">Subtotal:</span>
                  <span className="font-semibold text-[#9DC08B]">৳{orderData.subtotal || orderData.total_price || 0}</span>
                </div>
                {(orderData.discount || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#40513B]">Discount:</span>
                    <span className="font-semibold text-red-500">-৳{orderData.discount || 0}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#40513B]">Shipping:</span>
                  <span className="font-semibold text-[#9DC08B]">৳{orderData.shipping_cost || 0}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-[#40513B]">Total:</span>
                    <span className="text-[#9DC08B]">৳{orderData.total_amount || orderData.total_price || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-bold text-[#40513B] mb-6 flex items-center gap-2">
                <FaCreditCard className="text-[#9DC08B]" />
                Payment Details
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-[#40513B]">Payment Method:</span>
                  <span className="font-semibold text-[#9DC08B]">{orderData.payment_method || 'SSL Commerz'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#40513B]">Payment Status:</span>
                  <span className="text-green-600 font-semibold">Completed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#40513B]">Amount Paid:</span>
                  <span className="font-semibold text-[#9DC08B]">৳{orderData.total_amount || orderData.total_price || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#40513B]">Estimated Delivery:</span>
                  <span className="font-semibold text-[#9DC08B]">3-5 Business Days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          {orderData.order_items && orderData.order_items.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-md mt-8">
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
          )}

          {/* Shipping Address */}
          {orderData.shipping_address && (
            <div className="bg-white rounded-lg p-6 shadow-md mt-8">
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
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-lg p-6 mt-8">
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
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
};

export default OrderConfirmation; 