import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  TextField,
  CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import { getOrderStatusLabelAndColor } from '../../utils/orderStatusUtils';
import authService from '../../services/authService';
import riderService from '../../services/riderService';

const statusOptions = ['Pending', 'Approved', 'Shipped', 'Delivered', 'Cancelled'];

const statusMap = {
  Pending: 'pending',
  Processing: 'pending',
  Approved: 'approved',
  Shipped: 'shipped',
  Delivered: 'delivered',
  Cancelled: 'cancelled'
};

const OrderTable = ({ orders, onOrderUpdate }) => {
  const [updating, setUpdating] = useState({});
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [shippingData, setShippingData] = useState({
    courier_service: '',
    tracking_id: '',
    estimated_delivery: '',
    notes: '',
    rider_id: ''
  });
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [availableRiders, setAvailableRiders] = useState([]);
  const [riderSearchLocation, setRiderSearchLocation] = useState('');
  const [filteredRiders, setFilteredRiders] = useState([]);
  const [searchingRiders, setSearchingRiders] = useState(false);
  const [riderError, setRiderError] = useState('');
  const [deliveryAssignment, setDeliveryAssignment] = useState(null);
  // Default to 'Pending' tab
  const [statusFilter, setStatusFilter] = useState('Pending');

  const handleRowClick = async (order, event) => {
    // Prevent click if clicking on interactive elements
    if (event.target.closest('button') || event.target.closest('[role="button"]') || event.target.closest('select')) {
      return;
    }
    
    console.log('Row clicked:', order);
    setSelectedOrder(order);
    setModalOpen(true);
    
    // Fetch delivery assignment if order is shipped
    if (order.status === 'shipped') {
      try {
        const token = authService.getToken();
        const response = await fetch(`http://localhost:8000/api/v1/admin/orders/${order.id}/delivery-assignment`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          setDeliveryAssignment(result.data);
        } else {
          console.log('No delivery assignment found for this order');
          setDeliveryAssignment(null);
        }
      } catch (error) {
        console.error('Error fetching delivery assignment:', error);
        setDeliveryAssignment(null);
      }
    } else {
      setDeliveryAssignment(null);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  const handleShippingModalClose = () => {
    setShippingModalOpen(false);
    setShippingData({
      courier_service: '',
      tracking_id: '',
      estimated_delivery: '',
      notes: '',
      rider_id: ''
    });
    setRiderSearchLocation('');
    setFilteredRiders([]);
    setRiderError('');
  };

  // Fetch riders when shipping modal opens
  useEffect(() => {
    if (shippingModalOpen) {
      const fetchRiders = async () => {
        try {
          setRiderError('');
          const response = await riderService.getActiveRiders();
          
          if (response && response.riders) {
            setAvailableRiders(response.riders);
            setFilteredRiders(response.riders);
          } else {
            setAvailableRiders([]);
            setFilteredRiders([]);
            setRiderError('No riders available');
          }
        } catch (err) {
          console.error('Error fetching riders:', err);
          setRiderError('Error loading riders. Please try again.');
        }
      };
      fetchRiders();
    }
  }, [shippingModalOpen]);

  const filterRidersByLocation = async (location) => {
    if (!location.trim()) {
      setFilteredRiders(availableRiders);
      setRiderError('');
      return;
    }
    
    setSearchingRiders(true);
    setRiderError('');
    
    try {
      const response = await riderService.getRidersByZone(location);
      
      if (response && response.riders) {
        setFilteredRiders(response.riders);
        if (response.riders.length === 0) {
          setRiderError(`No riders found for location "${location}". Try a different location or clear the search.`);
        }
      } else {
        setFilteredRiders([]);
        setRiderError('No riders found for this location.');
      }
    } catch (error) {
      console.error('Error fetching riders by zone:', error);
      setRiderError('Error searching riders. Please try again.');
      
      // Fallback to client-side filtering
      const filtered = availableRiders.filter(rider => 
        rider.delivery_zones && rider.delivery_zones.some(zone => 
          zone.toLowerCase().includes(location.toLowerCase())
        )
      );
      setFilteredRiders(filtered);
      
      if (filtered.length === 0) {
        setRiderError(`No riders found for location "${location}". Try a different location or clear the search.`);
      }
    } finally {
      setSearchingRiders(false);
    }
  };

  const handleLocationSearch = (location) => {
    setRiderSearchLocation(location);
    filterRidersByLocation(location);
  };

  const handleAssignRider = async () => {
    if (!selectedOrder || !shippingData.rider_id) return;

    setUpdatingStatus(true);
    setError('');
    
    try {
      // Get auth token using authService
      const token = authService.getToken();
      
      console.log('Assigning rider:', {
        orderId: selectedOrder.id,
        riderId: shippingData.rider_id,
        token: token ? 'Present' : 'Missing'
      });
      
      const url = `http://localhost:8000/api/v1/admin/orders/${selectedOrder.id}/assign-rider`;
      console.log('Request URL:', url);
      console.log('Request method: POST');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          rider_id: shippingData.rider_id,
          delivery_notes: `Assigned by admin to order ${selectedOrder.id}`
        })
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Rider assignment successful:', result);
        alert(result.message);
        handleShippingModalClose();
        handleModalClose();
        if (onOrderUpdate) {
          onOrderUpdate(); // Refresh the orders list
        }
      } else {
        const errorText = await response.text();
        console.error('Rider assignment failed - Status:', response.status);
        console.error('Rider assignment failed - Response:', errorText);
        
        let errorMessage = 'Unknown error occurred';
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.detail || error.message || 'Unknown error';
        } catch (e) {
          errorMessage = errorText || 'Unknown error';
        }
        
        alert(`Failed to assign rider: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error assigning rider:', error);
      alert(`Error assigning rider: ${error.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedOrder) return;

    setUpdatingStatus(true);
    try {
      // Map frontend status names to backend status names
      const statusMap = {
        'Pending': 'pending',
        'Processing': 'pending',
        'Approved': 'approved', 
        'Shipped': 'shipped',
        'Delivered': 'delivered',
        'Cancelled': 'cancelled'
      };
      
      const backendStatus = statusMap[newStatus];
      if (!backendStatus) {
        alert(`Invalid status: ${newStatus}`);
        setUpdatingStatus(false);
        return;
      }
      
      const updateData = { status: backendStatus };
      
      // If status is "Shipped", include shipping data and rider assignment
      if (newStatus === 'Shipped') {
        // Enhanced validation for shipping
        const validationErrors = [];
        
        if (!shippingData.courier_service) {
          validationErrors.push('Courier service is required');
        }
        if (!shippingData.tracking_id) {
          validationErrors.push('Tracking ID is required');
        }
        if (!shippingData.rider_id) {
          validationErrors.push('Rider assignment is required');
        }
        
        if (validationErrors.length > 0) {
          alert(`Please complete the following: ${validationErrors.join(', ')}`);
          setUpdatingStatus(false);
          return;
        }
        
        updateData.shipping = shippingData;
      }

      // Get auth token using authService
      const token = authService.getToken();
      
      const response = await fetch(`http://localhost:8000/api/v1/admin/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        handleShippingModalClose();
        handleModalClose();
        if (onOrderUpdate) {
          onOrderUpdate();
        }
      } else {
        const errorText = await response.text();
        let errorMessage = 'Unknown error occurred';
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.detail || error.message || 'Unknown error';
        } catch (e) {
          errorMessage = errorText || 'Unknown error';
        }
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating((prev) => ({ ...prev, [orderId]: true }));
    setError('');
    
    try {
      // Get auth token using authService
      const token = authService.getToken();
      
      // Validate newStatus
      if (!newStatus) {
        throw new Error('Status is required');
      }
      
      // Get the mapped status
      const mappedStatus = statusMap[newStatus];
      if (!mappedStatus) {
        throw new Error(`Invalid status: ${newStatus}. Valid statuses: ${Object.keys(statusMap).join(', ')}`);
      }
      
      // Check if trying to set status to 'shipped' - open shipping modal directly
      if (mappedStatus === 'shipped') {
        // Find the order and open shipping modal
        const order = orders.find(o => o.id === orderId);
        if (order) {
          setSelectedOrder(order);
          setShippingModalOpen(true);
        }
        setUpdating((prev) => ({ ...prev, [orderId]: false }));
        return;
      }
      
      // Debug logging
      console.log('Status update request:', {
        orderId,
        newStatus,
        mappedStatus,
        statusMap,
        requestBody: { status: mappedStatus }
      });
      
      const response = await fetch(`http://localhost:8000/api/v1/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ status: mappedStatus }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Status update failed:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Failed to update order status: ${errorText}`);
      }
      
      // Call the callback to refresh orders
      if (onOrderUpdate) {
        onOrderUpdate();
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. Please try again.');
    } finally {
      setUpdating((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Remove orders with status 'pending' and description 'awaiting processing'
  const cleanedOrders = orders.filter(order => {
    if (order.status?.toLowerCase() === 'pending' && order.description?.toLowerCase() === 'awaiting processing') {
      return false;
    }
    return true;
  });

  // Sort orders from oldest to newest (by created_at or id ascending)
  const sortedOrders = [...cleanedOrders].sort((a, b) => {
    if (a.created_at && b.created_at) {
      return new Date(a.created_at) - new Date(b.created_at);
    }
    return (a.id || 0) - (b.id || 0);
  });

  // Filter orders by status (capitalize first letter)
  const filteredOrders = statusFilter === 'All'
    ? sortedOrders
    : sortedOrders.filter(order => {
        const { label } = getOrderStatusLabelAndColor(order.status);
        return label === statusFilter;
      });

  return (
    <Box>
      {/* Status Filter Tabs */}
      <Tabs
        value={statusFilter}
        onChange={(_, val) => setStatusFilter(val)}
        sx={{ mb: 2 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        {/* Status tabs first, 'All' last */}
        {statusOptions.map((status) => (
          <Tab key={status} label={status} value={status} />
        ))}
        <Tab label="All" value="All" />
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {filteredOrders.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            No orders found
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ 
          boxShadow: 2,
          border: '1px solid #dee2e6'
        }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Items</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Total Price</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Update Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => {
                const { label, color } = getOrderStatusLabelAndColor(order.status);
                return (
                  <TableRow 
                    key={order.id} 
                    hover 
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: '#f8f9fa',
                        cursor: 'pointer'
                      },
                      cursor: 'pointer',
                      '&:active': {
                        backgroundColor: '#e3f2fd'
                      }
                    }} 
                    onClick={(event) => handleRowClick(order, event)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {order.secure_order_id || `#${order.id}`}
                      </Typography>
                      {order.transaction_id && (
                        <Typography variant="caption" color="text.secondary">
                          TXN: {order.transaction_id}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {order.first_name} {order.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.email || 'No email'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.items?.length || 0} items
                      </Typography>
                      {order.items?.slice(0, 2).map((item, index) => (
                        <Typography key={index} variant="caption" display="block" color="text.secondary">
                          {item.product_name} (x{item.quantity})
                        </Typography>
                      ))}
                      {order.items?.length > 2 && (
                        <Typography variant="caption" color="text.secondary">
                          +{order.items.length - 2} more
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="#28a745">
                        ৳{order.total_price?.toFixed(2) || '0.00'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={label}
                        color={color}
                        size="small"
                        variant="outlined"
                        sx={{
                          '&.MuiChip-colorSuccess': {
                            borderColor: '#28a745',
                            color: '#28a745'
                          },
                          '&.MuiChip-colorPrimary': {
                            borderColor: '#17a2b8',
                            color: '#17a2b8'
                          },
                          '&.MuiChip-colorWarning': {
                            borderColor: '#ffc107',
                            color: '#ffc107'
                          },
                          '&.MuiChip-colorError': {
                            borderColor: '#dc3545',
                            color: '#dc3545'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={label}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updating[order.id]}
                        size="small"
                        sx={{ 
                          minWidth: 120,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#dee2e6'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#9DC08B'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#40513B'
                          }
                        }}
                      >
                        {statusOptions.map((status) => {
                          const { label: optionLabel } = getOrderStatusLabelAndColor(statusMap[status]);
                          return (
                            <MenuItem key={status} value={status}>
                              {status === 'Shipped' ? `${optionLabel} (Enter courier details)` : optionLabel}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog 
          open={modalOpen} 
          onClose={handleModalClose} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Order Details</Typography>
              {(() => {
                const { label, color } = getOrderStatusLabelAndColor(selectedOrder.status);
                return (
                  <Chip 
                    label={label} 
                    color={color}
                    variant="outlined"
                  />
                );
              })()}
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Order Information
                </Typography>
                <Typography variant="body2">Order ID: {selectedOrder.secure_order_id || `#${selectedOrder.id}`}</Typography>
                <Typography variant="body2">Date: {selectedOrder.order_date ? new Date(selectedOrder.order_date).toLocaleString() : ''}</Typography>
                <Typography variant="body2">Status: {getOrderStatusLabelAndColor(selectedOrder.status).label}</Typography>
                <Typography variant="body2">Total: ৳{selectedOrder.total_price?.toFixed(2) || selectedOrder.total_price || '0.00'}</Typography>
                {selectedOrder.transaction_id && (
                  <Typography variant="body2">Transaction ID: {selectedOrder.transaction_id}</Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Customer Information
                </Typography>
                <Typography variant="body2">Name: {selectedOrder.first_name} {selectedOrder.last_name}</Typography>
                <Typography variant="body2">Email: {selectedOrder.email}</Typography>
                <Typography variant="body2">Phone: {selectedOrder.phone}</Typography>
              </Grid>
            </Grid>

            {/* Order Items */}
            <Box mt={3}>
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>Order Items:</Typography>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <Box>
                  {selectedOrder.items.map((item, idx) => (
                    <Box key={idx} mb={1} p={2} bgcolor="#f8f9fa" borderRadius={1}>
                      <Typography variant="body2">
                        <strong>{item.product_name}</strong> - Quantity: {item.quantity} - Price: ৳{item.price?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">No items found.</Typography>
              )}
            </Box>

            {/* Shipping Address */}
            <Box mt={3}>
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>Shipping Address:</Typography>
              {selectedOrder.address ? (
                <Box p={2} bgcolor="#f8f9fa" borderRadius={1}>
                  <Typography variant="body2">
                    {selectedOrder.address.street}, {selectedOrder.address.city}, {selectedOrder.address.division}, {selectedOrder.address.country} {selectedOrder.address.postal_code}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">No address found.</Typography>
              )}
            </Box>

            {/* Delivery Assignment Information */}
            {selectedOrder.status === 'shipped' && (
              <Box mt={3}>
                <Typography variant="subtitle2" fontWeight="bold" mb={1}>Delivery Assignment:</Typography>
                {deliveryAssignment ? (
                  <Box p={2} bgcolor="#e8f5e8" borderRadius={1}>
                    <Typography variant="body2" fontWeight="medium">
                      Assigned Rider: {deliveryAssignment.rider_details?.user_name || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Vehicle: {deliveryAssignment.rider_details?.vehicle_type || 'N/A'} - {deliveryAssignment.rider_details?.vehicle_number || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Assignment Status: {deliveryAssignment.status || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Assigned Date: {deliveryAssignment.assigned_at ? new Date(deliveryAssignment.assigned_at).toLocaleDateString() : 'N/A'}
                    </Typography>
                    {deliveryAssignment.estimated_delivery && (
                      <Typography variant="body2" color="text.secondary">
                        Estimated Delivery: {new Date(deliveryAssignment.estimated_delivery).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">No delivery assignment found</Typography>
                )}
              </Box>
            )}

            {/* Status Update Buttons */}
            <Box mt={3}>
              <Divider />
              <Box mt={2}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Update Order Status
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  {selectedOrder.status.toLowerCase() !== 'processing' && (
                    <Button 
                      variant="outlined" 
                      color="primary"
                      onClick={() => handleStatusUpdate('Processing')}
                      disabled={updatingStatus}
                    >
                      Mark as Processing
                    </Button>
                  )}
                  {selectedOrder.status.toLowerCase() !== 'shipped' && (
                    <Button 
                      variant="outlined" 
                      color="warning"
                      startIcon={<LocalShippingIcon />}
                      onClick={() => setShippingModalOpen(true)}
                      disabled={updatingStatus}
                    >
                      Mark as Shipped
                    </Button>
                  )}
                  {selectedOrder.status.toLowerCase() !== 'delivered' && (
                    <Button 
                      variant="outlined" 
                      color="success"
                      onClick={() => handleStatusUpdate('Delivered')}
                      disabled={updatingStatus}
                    >
                      Mark as Delivered
                    </Button>
                  )}
                  {selectedOrder.status.toLowerCase() !== 'cancelled' && (
                    <Button 
                      variant="outlined" 
                      color="error"
                      onClick={() => handleStatusUpdate('Cancelled')}
                      disabled={updatingStatus}
                    >
                      Cancel Order
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleModalClose} color="secondary">Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Shipping Details Modal */}
      <Dialog 
        open={shippingModalOpen} 
        onClose={handleShippingModalClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            background: '#ffffff'
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#40513B',
          color: 'white',
          borderRadius: '8px 8px 0 0',
          pb: 3
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <LocalShippingIcon sx={{ mr: 2, fontSize: 28 }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Shipping Details
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                  Order #{selectedOrder?.secure_order_id || selectedOrder?.id}
                </Typography>
              </Box>
            </Box>
            <Chip 
              label="Required Fields" 
              color="warning" 
              size="small" 
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)'
              }} 
            />
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4, background: '#fafbfc' }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Please provide the courier service information to mark this order as shipped. 
              An email notification will be sent to the customer with tracking details.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Courier Service Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel sx={{ color: '#40513B', fontWeight: 500, fontSize: '1rem' }}>
                  Courier Service *
                </InputLabel>
                <Select
                  value={shippingData.courier_service}
                  onChange={(e) => setShippingData({...shippingData, courier_service: e.target.value})}
                  label="Courier Service *"
                  sx={{
                    height: 56,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#9DC08B',
                      borderWidth: 2
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#40513B'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#40513B',
                      borderWidth: 2
                    },
                    backgroundColor: 'white',
                    borderRadius: 1,
                    '& .MuiSelect-select': {
                      fontSize: '1rem',
                      paddingTop: 1.5,
                      paddingBottom: 1.5
                    }
                  }}
                >
                  <MenuItem value="FedEx" sx={{ py: 1.5 }}>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        backgroundColor: '#FF6600', 
                        borderRadius: '50%', 
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 12,
                        fontWeight: 'bold'
                      }}>
                        F
                      </Box>
                      FedEx Express
                    </Box>
                  </MenuItem>
                  <MenuItem value="UPS" sx={{ py: 1.5 }}>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        backgroundColor: '#351C15', 
                        borderRadius: '50%', 
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 12,
                        fontWeight: 'bold'
                      }}>
                        U
                      </Box>
                      UPS
                    </Box>
                  </MenuItem>
                  <MenuItem value="DHL" sx={{ py: 1.5 }}>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        backgroundColor: '#D40511', 
                        borderRadius: '50%', 
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 12,
                        fontWeight: 'bold'
                      }}>
                        D
                      </Box>
                      DHL Express
                    </Box>
                  </MenuItem>
                  <MenuItem value="USPS" sx={{ py: 1.5 }}>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        backgroundColor: '#0052A5', 
                        borderRadius: '50%', 
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 12,
                        fontWeight: 'bold'
                      }}>
                        U
                      </Box>
                      USPS
                    </Box>
                  </MenuItem>
                  <MenuItem value="Amazon Logistics" sx={{ py: 1.5 }}>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        backgroundColor: '#FF9900', 
                        borderRadius: '50%', 
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 12,
                        fontWeight: 'bold'
                      }}>
                        A
                      </Box>
                      Amazon Logistics
                    </Box>
                  </MenuItem>
                  <MenuItem value="Local Courier" sx={{ py: 1.5 }}>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        backgroundColor: '#28a745', 
                        borderRadius: '50%', 
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 12,
                        fontWeight: 'bold'
                      }}>
                        L
                      </Box>
                      Local Courier
                    </Box>
                  </MenuItem>
                  <MenuItem value="Other" sx={{ py: 1.5 }}>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        backgroundColor: '#6c757d', 
                        borderRadius: '50%', 
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 12,
                        fontWeight: 'bold'
                      }}>
                        O
                      </Box>
                      Other
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Tracking ID */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Tracking ID *"
                value={shippingData.tracking_id}
                onChange={(e) => setShippingData({...shippingData, tracking_id: e.target.value})}
                placeholder="Enter tracking number from courier service"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 56,
                    '& fieldset': {
                      borderColor: '#9DC08B',
                      borderWidth: 2
                    },
                    '&:hover fieldset': {
                      borderColor: '#40513B'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#40513B',
                      borderWidth: 2
                    },
                    backgroundColor: 'white',
                    borderRadius: 1
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1rem',
                    color: '#40513B',
                    fontWeight: 500
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '1rem',
                    paddingTop: 1.5,
                    paddingBottom: 1.5
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ 
                      mr: 2, 
                      color: '#40513B',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '1.2rem'
                    }}>
                      📦
                    </Box>
                  )
                }}
              />
            </Grid>

            {/* Estimated Delivery */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Estimated Delivery"
                value={shippingData.estimated_delivery}
                onChange={(e) => setShippingData({...shippingData, estimated_delivery: e.target.value})}
                placeholder="e.g., 3-5 business days"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 56,
                    '& fieldset': {
                      borderColor: '#9DC08B',
                      borderWidth: 2
                    },
                    '&:hover fieldset': {
                      borderColor: '#40513B'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#40513B',
                      borderWidth: 2
                    },
                    backgroundColor: 'white',
                    borderRadius: 1
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1rem',
                    color: '#40513B',
                    fontWeight: 500
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '1rem',
                    paddingTop: 1.5,
                    paddingBottom: 1.5
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ 
                      mr: 2, 
                      color: '#40513B',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '1.2rem'
                    }}>
                      📅
                    </Box>
                  )
                }}
              />
            </Grid>

            {/* Customer Info Display */}
            <Grid item xs={12}>
              <Box sx={{ 
                p: 3, 
                backgroundColor: 'white', 
                borderRadius: 1, 
                border: '2px solid #e3f2fd',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Typography variant="h6" fontWeight="bold" color="#40513B" gutterBottom>
                  📧 Customer Notification
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                  An email will be sent to: <strong>{selectedOrder?.email}</strong>
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Customer: <strong>{selectedOrder?.first_name} {selectedOrder?.last_name}</strong>
                </Typography>
              </Box>
            </Grid>

            {/* Rider Assignment */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ color: '#40513B', fontWeight: 'bold' }}>
                Rider Assignment
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Select a rider to handle the delivery for this order
              </Typography>

            </Grid>
            <Grid item xs={12}>
              <Box display="flex" gap={1} alignItems="flex-end">
                <TextField
                  fullWidth
                  label="Search by Location"
                  value={riderSearchLocation}
                  onChange={(e) => handleLocationSearch(e.target.value)}
                  placeholder="Enter delivery location to find suitable riders..."
                  helperText="Common zones: Dhaka, Gulshan, Banani, Dhanmondi, Mirpur, Uttara, Motijheel, Lalbagh"
                  InputProps={{
                    endAdornment: searchingRiders ? (
                      <CircularProgress size={20} />
                    ) : null,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#9DC08B',
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: '#40513B'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#40513B',
                        borderWidth: 2
                      },
                      backgroundColor: 'white',
                      borderRadius: 1
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1rem',
                      color: '#40513B',
                      fontWeight: 500
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '1rem',
                      paddingTop: 1.5,
                      paddingBottom: 1.5
                    }
                  }}
                />
                {riderSearchLocation && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleLocationSearch('')}
                    sx={{ minWidth: 'auto', px: 2 }}
                  >
                    Clear
                  </Button>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required error={!shippingData.rider_id}>
                <InputLabel sx={{ color: !shippingData.rider_id ? '#d32f2f' : '#40513B', fontWeight: 500, fontSize: '1rem' }}>
                  Select Rider *
                </InputLabel>
                <Select
                  value={shippingData.rider_id}
                  onChange={(e) => {
                    setShippingData({...shippingData, rider_id: e.target.value});
                  }}
                  label="Select Rider *"
                  sx={{
                    height: 56,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: !shippingData.rider_id ? '#d32f2f' : '#9DC08B',
                      borderWidth: 2
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: !shippingData.rider_id ? '#d32f2f' : '#40513B',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: !shippingData.rider_id ? '#d32f2f' : '#40513B',
                      borderWidth: 2
                    },
                    backgroundColor: 'white',
                    borderRadius: 1,
                    '& .MuiSelect-select': {
                      fontSize: '1rem',
                      paddingTop: 1.5,
                      paddingBottom: 1.5
                    }
                  }}
                >
                  {(filteredRiders.length > 0 ? filteredRiders : availableRiders).map((rider) => (
                    <MenuItem key={rider.id} value={rider.id}>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {rider.user_name || `Rider ${rider.id}`} - {rider.vehicle_type}
                        </Typography>
                        {rider.delivery_zones && rider.delivery_zones.length > 0 && (
                          <Typography variant="body2" color="text.secondary">
                            Zones: {rider.delivery_zones.join(', ')}
                          </Typography>
                        )}
                                                  <Typography variant="body2" color="text.secondary">
                            Deliveries: {rider.total_deliveries || 0}
                          </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                  {(filteredRiders.length > 0 ? filteredRiders : availableRiders).length === 0 && (
                    <MenuItem disabled>No riders available</MenuItem>
                  )}
                </Select>
                {!shippingData.rider_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    ⚠️ Rider selection is required for shipping
                  </Typography>
                )}
              </FormControl>
              {riderError && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  {riderError}
                </Alert>
              )}
              {shippingData.rider_id && (
                <Alert severity="success" sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    ✅ Rider selected! Ready to proceed with shipping.
                  </Typography>
                </Alert>
              )}
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Additional Notes (Optional)"
                value={shippingData.notes}
                onChange={(e) => setShippingData({...shippingData, notes: e.target.value})}
                placeholder="Add any special instructions or notes for the customer..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#9DC08B',
                      borderWidth: 2
                    },
                    '&:hover fieldset': {
                      borderColor: '#40513B'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#40513B',
                      borderWidth: 2
                    },
                    backgroundColor: 'white',
                    borderRadius: 1
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1rem',
                    color: '#40513B',
                    fontWeight: 500
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '1rem',
                    paddingTop: 1.5,
                    paddingBottom: 1.5
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ 
                      mr: 2, 
                      color: '#40513B',
                      display: 'flex',
                      alignItems: 'flex-start',
                      mt: 1,
                      fontSize: '1.2rem'
                    }}>
                      📝
                    </Box>
                  )
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          background: '#f5f5f5',
          borderRadius: '0 0 8px 8px',
          borderTop: '1px solid #e0e0e0'
        }}>
          <Button 
            onClick={handleShippingModalClose} 
            variant="outlined"
            sx={{
              borderColor: '#757575',
              color: '#757575',
              px: 3,
              py: 1.5,
              borderRadius: 1,
              fontSize: '1rem',
              fontWeight: 500,
              '&:hover': {
                borderColor: '#424242',
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAssignRider}
            variant="outlined" 
            color="primary"
            disabled={updatingStatus || !shippingData.rider_id}
            sx={{ 
              mr: 1,
              borderColor: '#1976d2',
              color: '#1976d2',
              px: 3,
              py: 1.5,
              borderRadius: 1,
              fontSize: '1rem',
              fontWeight: 500,
              '&:hover': {
                borderColor: '#1565c0',
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            {updatingStatus ? 'Assigning...' : 'Assign Rider Only'}
          </Button>
          <Button 
            onClick={() => handleStatusUpdate('Shipped')} 
            variant="contained" 
            disabled={updatingStatus || !shippingData.courier_service || !shippingData.tracking_id || !shippingData.rider_id}
            startIcon={<LocalShippingIcon />}
            sx={{
              backgroundColor: '#40513B',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: 1,
              fontSize: '1rem',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#2e3f2c',
                boxShadow: '0 4px 12px rgba(64, 81, 59, 0.3)'
              },
              '&:disabled': {
                backgroundColor: '#bdbdbd',
                color: '#757575',
                boxShadow: 'none'
              }
            }}
          >
            {updatingStatus ? 'Updating...' : 'Mark as Shipped'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderTable; 