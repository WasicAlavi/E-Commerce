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

  // Mock tracking data
  const mockTrackingData = {
    'ORD-001': {
      orderNumber: 'ORD-001',
      status: 'In Transit',
      estimatedDelivery: '2024-01-20',
      items: [
        { name: 'Premium Cotton T-Shirt', quantity: 2 },
        { name: 'Denim Jeans', quantity: 1 }
      ],
      total: 5500,
      timeline: [
        {
          status: 'Order Placed',
          date: '2024-01-15',
          time: '10:30 AM',
          completed: true,
          icon: <FaCheckCircle className="text-green-500" />
        },
        {
          status: 'Order Confirmed',
          date: '2024-01-15',
          time: '11:45 AM',
          completed: true,
          icon: <FaCheckCircle className="text-green-500" />
        },
        {
          status: 'Processing',
          date: '2024-01-16',
          time: '09:15 AM',
          completed: true,
          icon: <FaCheckCircle className="text-green-500" />
        },
        {
          status: 'Shipped',
          date: '2024-01-17',
          time: '02:30 PM',
          completed: true,
          icon: <FaTruck className="text-blue-500" />
        },
        {
          status: 'In Transit',
          date: '2024-01-18',
          time: 'Current',
          completed: false,
          icon: <FaClock className="text-yellow-500" />
        },
        {
          status: 'Delivered',
          date: '2024-01-20',
          time: 'Estimated',
          completed: false,
          icon: <FaBox className="text-gray-400" />
        }
      ],
      shippingInfo: {
        carrier: 'Express Delivery',
        trackingNumber: 'TRK123456789',
        origin: 'Dhaka Warehouse',
        destination: 'Dhaka, Bangladesh'
      }
    }
  };

  const handleTrackOrder = () => {
    if (!orderNumber.trim()) {
      alert('Please enter an order number');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const result = mockTrackingData[orderNumber.toUpperCase()];
      setTrackingResult(result);
      setIsLoading(false);
      
      if (!result) {
        alert('Order not found. Please check your order number.');
      }
    }, 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'text-green-600';
      case 'In Transit':
        return 'text-blue-600';
      case 'Shipped':
        return 'text-purple-600';
      case 'Processing':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100';
      case 'In Transit':
        return 'bg-blue-100';
      case 'Shipped':
        return 'bg-purple-100';
      case 'Processing':
        return 'bg-yellow-100';
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
                      Order #{trackingResult.orderNumber}
                    </h3>
                    <p className="text-gray-600">
                      Estimated Delivery: {trackingResult.estimatedDelivery}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBgColor(trackingResult.status)} ${getStatusColor(trackingResult.status)}`}>
                      {trackingResult.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-[#40513B] mb-2">Order Items</h4>
                    <div className="space-y-1">
                      {trackingResult.items.map((item, index) => (
                        <div key={index} className="text-sm text-[#40513B]">
                          {item.name} x{item.quantity}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <span className="font-semibold text-[#9DC08B]">
                        Total: ৳{trackingResult.total}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-[#40513B] mb-2">Shipping Information</h4>
                    <div className="space-y-1 text-sm text-[#40513B]">
                      <p><strong>Carrier:</strong> {trackingResult.shippingInfo.carrier}</p>
                      <p><strong>Tracking Number:</strong> {trackingResult.shippingInfo.trackingNumber}</p>
                      <p><strong>Origin:</strong> {trackingResult.shippingInfo.origin}</p>
                      <p><strong>Destination:</strong> {trackingResult.shippingInfo.destination}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-xl font-semibold text-[#40513B] mb-6">Order Timeline</h3>
                <div className="space-y-4">
                  {trackingResult.timeline.map((step, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-[#9DC08B]' : 'bg-gray-200'
                      }`}>
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className={`font-medium ${
                              step.completed ? 'text-[#40513B]' : 'text-gray-500'
                            }`}>
                              {step.status}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {step.date} at {step.time}
                            </p>
                          </div>
                          {step.completed && (
                            <span className="text-green-500 text-sm">✓ Completed</span>
                          )}
                        </div>
                        {index < trackingResult.timeline.length - 1 && (
                          <div className={`w-0.5 h-8 ml-4 mt-2 ${
                            step.completed ? 'bg-[#9DC08B]' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                    </div>
                  ))}
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