import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { FaSearch, FaTruck, FaCheckCircle, FaClock, FaBox } from 'react-icons/fa';

const StyledButton = styled(Button)(({ theme }) => ({
  fontFamily: 'Montserrat, sans-serif',
  backgroundColor: '#9DC08B',
  color: '#fff',
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 500,
  padding: '10px 20px',
  '&:hover': {
    backgroundColor: '#40513B',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    fontFamily: 'Montserrat, sans-serif',
    color: '#40513B',
  },
  '& .MuiInputLabel-root': {
    fontFamily: 'Montserrat, sans-serif',
    color: '#40513B',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#9DC08B',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#9DC08B',
    },
    '&:hover fieldset': {
      borderColor: '#40513B',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#9DC08B',
    },
  },
}));

const OrderTracking = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrackOrder = async () => {
    if (!orderNumber.trim()) {
      alert('Please enter an order number');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`http://localhost:8000/api/v1/orders/track/${orderNumber.trim()}`);
      
      if (response.ok) {
        const result = await response.json();
        setTrackingResult(result.data);
      } else {
        const error = await response.json();
        alert(error.detail || 'Order not found. Please check your order number.');
        setTrackingResult(null);
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      alert('Error tracking order. Please try again.');
      setTrackingResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'delivered':
        return 'text-green-600';
      case 'shipped':
        return 'text-blue-600';
      case 'approved':
        return 'text-purple-600';
      case 'processing':
        return 'text-yellow-600';
      case 'pending':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBgColor = (status) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'delivered':
        return 'bg-green-100';
      case 'shipped':
        return 'bg-blue-100';
      case 'approved':
        return 'bg-purple-100';
      case 'processing':
        return 'bg-yellow-100';
      case 'pending':
        return 'bg-orange-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="bg-[#EDF6E5] min-h-screen py-8 font-montserrat">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#40513B] text-center mb-8">
            Track Your Order
          </h1>

          {/* Search Section */}
          <div className="bg-white rounded-lg p-8 shadow-md mb-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-[#40513B] mb-2">
                Enter Your Order Number
              </h2>
              <p className="text-gray-600">
                Track your order status and get real-time updates
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <StyledTextField
                fullWidth
                label="Order Number"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g., ORD-001"
                onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
              />
              <StyledButton
                variant="contained"
                onClick={handleTrackOrder}
                disabled={isLoading}
                startIcon={<FaSearch />}
              >
                {isLoading ? 'Tracking...' : 'Track Order'}
              </StyledButton>
            </div>
          </div>

          {/* Tracking Result */}
          {trackingResult && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[#40513B]">
                      Order #{trackingResult.order.secure_order_id}
                    </h3>
                    <p className="text-gray-600">
                      Order Date: {new Date(trackingResult.order.order_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBgColor(trackingResult.order.status)} ${getStatusColor(trackingResult.order.status)}`}>
                      {trackingResult.order.status.charAt(0).toUpperCase() + trackingResult.order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-[#40513B] mb-2">Order Items</h4>
                    <div className="space-y-1">
                      {trackingResult.items && trackingResult.items.length > 0 ? (
                        trackingResult.items.map((item, index) => (
                          <div key={index} className="text-sm text-[#40513B]">
                            {item.product_name || 'Product'} x{item.quantity}
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">No items found</div>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <span className="font-semibold text-[#9DC08B]">
                        Total: ৳{trackingResult.order.total_price?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-[#40513B] mb-2">Shipping Information</h4>
                    {trackingResult.shipping_info ? (
                      <div className="space-y-1 text-sm text-[#40513B]">
                        <p><strong>Courier Service:</strong> {trackingResult.shipping_info.courier_service}</p>
                        <p><strong>Tracking ID:</strong> {trackingResult.shipping_info.tracking_id}</p>
                        {trackingResult.shipping_info.estimated_delivery && (
                          <p><strong>Estimated Delivery:</strong> {trackingResult.shipping_info.estimated_delivery}</p>
                        )}
                        {trackingResult.shipping_info.notes && (
                          <p><strong>Notes:</strong> {trackingResult.shipping_info.notes}</p>
                        )}
                        {trackingResult.rider_info && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-[#9DC08B] font-medium">
                              ✅ Rider Assigned: {trackingResult.rider_info.name}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        Shipping information not available yet
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Assignment Information */}
                {trackingResult.delivery_assignment && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-[#40513B] mb-2">Delivery Assignment</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#40513B]">
                      <div>
                        <p><strong>Assignment ID:</strong> {trackingResult.delivery_assignment.secure_assignment_id}</p>
                        <p><strong>Status:</strong> {trackingResult.delivery_assignment.status}</p>
                        <p><strong>Assigned At:</strong> {new Date(trackingResult.delivery_assignment.assigned_at).toLocaleString()}</p>
                        {trackingResult.delivery_assignment.estimated_delivery && (
                          <p><strong>Estimated Delivery:</strong> {new Date(trackingResult.delivery_assignment.estimated_delivery).toLocaleString()}</p>
                        )}
                      </div>
                      <div>
                        {trackingResult.delivery_assignment.accepted_at && (
                          <p><strong>Accepted At:</strong> {new Date(trackingResult.delivery_assignment.accepted_at).toLocaleString()}</p>
                        )}
                        {trackingResult.delivery_assignment.actual_delivery && (
                          <p><strong>Actual Delivery:</strong> {new Date(trackingResult.delivery_assignment.actual_delivery).toLocaleString()}</p>
                        )}
                        {trackingResult.delivery_assignment.delivery_notes && (
                          <p><strong>Notes:</strong> {trackingResult.delivery_assignment.delivery_notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Assigned Rider Information - Show when order is shipped */}
                {trackingResult.rider_info && trackingResult.order.status === 'shipped' && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-[#40513B] mb-2 flex items-center gap-2">
                      <FaTruck className="text-[#9DC08B]" />
                      Assigned Rider
                    </h4>
                    <div className="bg-[#f8f9fa] rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#40513B]">
                        <div>
                          <p><strong>Rider Name:</strong> {trackingResult.rider_info.name}</p>
                          <p><strong>Vehicle Type:</strong> {trackingResult.rider_info.vehicle_type || 'Not specified'}</p>
                          <p><strong>Zone:</strong> {trackingResult.rider_info.zone || 'Not specified'}</p>
                        </div>
                        <div>
                          {trackingResult.rider_info.phone && (
                            <p><strong>Contact:</strong> {trackingResult.rider_info.phone}</p>
                          )}
                          <p><strong>Status:</strong> 
                            <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                              trackingResult.rider_info.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {trackingResult.rider_info.status}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          Your order has been assigned to a rider and is on its way to you. 
                          The rider will contact you when they are near your delivery location.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer Information */}
                {trackingResult.customer && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-[#40513B] mb-2">Customer Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#40513B]">
                      <div>
                        <p><strong>Name:</strong> {trackingResult.customer.first_name} {trackingResult.customer.last_name}</p>
                        <p><strong>Email:</strong> {trackingResult.customer.email}</p>
                      </div>
                      <div>
                        <p><strong>Phone:</strong> {trackingResult.customer.phone}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Shipping Address */}
                {trackingResult.address && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-[#40513B] mb-2">Shipping Address</h4>
                    <div className="text-sm text-[#40513B]">
                      <p>{trackingResult.address.street}</p>
                      <p>{trackingResult.address.city}, {trackingResult.address.division}</p>
                      <p>{trackingResult.address.country} - {trackingResult.address.postal_code}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Status Timeline */}
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-xl font-semibold text-[#40513B] mb-6">Order Status</h3>
                <div className="space-y-4">
                  {(() => {
                    const statuses = [
                      { status: 'pending', label: 'Order Placed', icon: <FaCheckCircle className="text-green-500" /> },
                      { status: 'processing', label: 'Processing', icon: <FaClock className="text-yellow-500" /> },
                      { status: 'approved', label: 'Approved', icon: <FaCheckCircle className="text-green-500" /> },
                      { 
                        status: 'shipped', 
                        label: trackingResult.rider_info ? 'Shipped with Rider' : 'Shipped', 
                        icon: <FaTruck className="text-blue-500" /> 
                      },
                      { status: 'delivered', label: 'Delivered', icon: <FaBox className="text-green-500" /> }
                    ];
                    
                    const currentStatus = trackingResult.order.status.toLowerCase();
                    const currentIndex = statuses.findIndex(s => s.status === currentStatus);
                    
                    return statuses.map((step, index) => {
                      const isCompleted = index <= currentIndex;
                      const isCurrent = index === currentIndex;
                      
                      return (
                        <div key={index} className="flex items-start gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isCompleted ? 'bg-[#9DC08B]' : 'bg-gray-200'
                          }`}>
                            {step.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className={`font-medium ${
                                  isCompleted ? 'text-[#40513B]' : 'text-gray-500'
                                }`}>
                                  {step.label}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {isCurrent ? 'Current Status' : isCompleted ? 'Completed' : 'Pending'}
                                  {isCurrent && step.status === 'shipped' && trackingResult.rider_info && (
                                    <span className="block text-[#9DC08B] font-medium">
                                      Rider: {trackingResult.rider_info.name}
                                    </span>
                                  )}
                                </p>
                              </div>
                              {isCompleted && (
                                <span className="text-green-500 text-sm">✓ {isCurrent ? 'Current' : 'Completed'}</span>
                              )}
                            </div>
                            {index < statuses.length - 1 && (
                              <div className={`w-0.5 h-8 ml-4 mt-2 ${
                                isCompleted ? 'bg-[#9DC08B]' : 'bg-gray-200'
                              }`} />
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold text-[#40513B] mb-4">Need Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#40513B]">
              <div>
                <p><strong>Can't find your order?</strong></p>
                <p>Check your email for the order confirmation or contact our support team.</p>
              </div>
              <div>
                <p><strong>Delivery taking longer than expected?</strong></p>
                <p>Delivery times may vary based on your location and current circumstances.</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                For additional support, please contact us at{' '}
                <a href="mailto:support@silkroad.com" className="text-[#9DC08B] hover:underline">
                  support@silkroad.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking; 