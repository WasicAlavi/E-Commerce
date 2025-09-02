import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useAuth } from '../../AuthContext';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import authService from '../../services/authService';
import { getOrderStatusLabelAndColor } from '../../utils/orderStatusUtils';
import riderService from '../../services/riderService';

const AdminOrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
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

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Debug modal state changes
  useEffect(() => {
    console.log('Modal state changed:', { modalOpen, selectedOrder: selectedOrder?.id });
  }, [modalOpen, selectedOrder]);

  // Debug shipping modal state
  useEffect(() => {
    console.log('Shipping modal state changed:', { 
      shippingModalOpen, 
      shippingData,
      availableRiders: availableRiders.length,
      filteredRiders: filteredRiders.length
    });
  }, [shippingModalOpen, shippingData, availableRiders, filteredRiders]);

  // Fetch riders when shipping modal opens
  useEffect(() => {
    if (shippingModalOpen) {
      const fetchRiders = async () => {
        try {
          setRiderError('');
          console.log('Fetching active riders...');
          const response = await riderService.getActiveRiders();
          console.log('Active riders response:', response);
          
          if (response && response.riders) {
            setAvailableRiders(response.riders);
            setFilteredRiders(response.riders);
            console.log(`Loaded ${response.riders.length} riders`);
          } else {
            setAvailableRiders([]);
            setFilteredRiders([]);
            setRiderError('No riders available');
            console.log('No riders found in response');
          }
        } catch (err) {
          console.error('Error fetching riders:', err);
          setRiderError('Error loading riders. Please try again.');
        }
      };
      fetchRiders();
    }
  }, [shippingModalOpen]);

  // Filter orders by secure_order_id or id
  const filteredOrders = orders.filter(order => {
    const secureId = (order.secure_order_id || '').toLowerCase();
    const id = String(order.id);
    return secureId.includes(debouncedSearch.toLowerCase()) || id.includes(debouncedSearch);
  });

  const handleRowClick = async (order, event) => {
    // Prevent click if clicking on interactive elements
    if (event.target.closest('button') || event.target.closest('[role="button"]') || event.target.closest('select')) {
      return;
    }
    
    console.log('Row clicked:', order);
    console.log('Event target:', event.target);
    console.log('Event currentTarget:', event.currentTarget);
    
    // Add a visual indicator that the click was registered
    if (event.currentTarget && event.currentTarget.style) {
      event.currentTarget.style.backgroundColor = '#e3f2fd';
      setTimeout(() => {
        if (event.currentTarget && event.currentTarget.style) {
          event.currentTarget.style.backgroundColor = '';
        }
      }, 200);
    }
    
    console.log('Setting selected order:', order);
    setSelectedOrder(order);
    console.log('Setting modal open to true');
    setModalOpen(true);
    
    // Fetch delivery assignment if order is shipped
    if (order.status === 'shipped') {
      try {
        const token = authService.getToken();
        const response = await fetch(`${API_BASE_URL}/admin/orders/${order.id}/delivery-assignment`, {
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
    console.log('Closing modal');
    setModalOpen(false);
    setSelectedOrder(null);
  };

  const handleShippingModalClose = () => {
    console.log('Closing shipping modal');
    console.log('Resetting shipping data');
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

  const filterRidersByLocation = async (location) => {
    if (!location.trim()) {
      setFilteredRiders(availableRiders);
      setRiderError('');
      return;
    }
    
    setSearchingRiders(true);
    setRiderError('');
    
    try {
      // Use backend API to get riders by zone for more efficient filtering
      const response = await riderService.getRidersByZone(location);
      console.log('Riders by zone response:', response);
      
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
      
      const url = `${API_BASE_URL}/admin/orders/${selectedOrder.id}/assign-rider`;
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
        fetchOrders(); // Refresh the orders list
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
        
        setError(`Failed to assign rider: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error assigning rider:', error);
      setError(`Error assigning rider: ${error.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedOrder) return;

    setUpdatingStatus(true);
    setError('');
    
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
        setError(`Invalid status: ${newStatus}`);
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
          setError(`Please complete the following: ${validationErrors.join(', ')}`);
          setUpdatingStatus(false);
          return;
        }
        
        updateData.shipping = shippingData;
      }

      // Get auth token using authService
      const token = authService.getToken();
      
      console.log('Sending status update:', {
        orderId: selectedOrder.id,
        newStatus,
        backendStatus,
        updateData,
        token: token ? 'Present' : 'Missing'
      });
      
      const url = `${API_BASE_URL}/admin/orders/${selectedOrder.id}/status`;
      console.log('Request URL:', url);
      console.log('Request method: PUT');
      console.log('Request headers:', {
        'Content-Type': 'application/json',
        'Authorization': token ? 'Bearer [TOKEN]' : 'No token'
      });
      console.log('Request body:', JSON.stringify(updateData, null, 2));
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(updateData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Status update successful:', result);
        alert(result.message);
        handleShippingModalClose();
        handleModalClose();
        fetchOrders(); // Refresh the orders list
      } else {
        const errorText = await response.text();
        console.error('Status update failed - Status:', response.status);
        console.error('Status update failed - Response:', errorText);
        
        let errorMessage = 'Unknown error occurred';
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.detail || error.message || 'Unknown error';
        } catch (e) {
          errorMessage = errorText || 'Unknown error';
        }
        
        // Show more specific error messages
        if (response.status === 400) {
          if (errorMessage.includes('Rider assignment is required')) {
            setError('Please select a rider for delivery assignment');
          } else if (errorMessage.includes('Courier service and tracking ID are required')) {
            setError('Please provide courier service and tracking ID');
          } else if (errorMessage.includes('Invalid status')) {
            setError(`Invalid status: ${errorMessage}`);
          } else {
            setError(`Bad Request: ${errorMessage}`);
          }
        } else if (response.status === 404) {
          setError('Order not found');
        } else if (response.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else {
          setError(`Error: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = authService.getToken();
      const response = await fetch('${API_BASE_URL}/admin/orders', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setOrders(result.data || []);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch orders:', errorText);
        setError('Failed to load orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusLabelAndColor = (status) => {
    const statusConfig = {
      'pending': { label: 'Pending', color: 'warning' },
      'approved': { label: 'Approved', color: 'primary' },
      'shipped': { label: 'Shipped', color: 'info' },
      'delivered': { label: 'Delivered', color: 'success' },
      'cancelled': { label: 'Cancelled', color: 'error' }
    };
    return statusConfig[status] || { label: status, color: 'default' };
  };

  if (!user || user.role !== 'admin') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Access denied. Admin privileges required.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ color: '#40513B', fontWeight: 'bold' }}>
            Order Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ShoppingCartIcon />}
              onClick={() => navigate('/admin')}
              sx={{ 
                borderColor: '#9DC08B',
                color: '#9DC08B',
                '&:hover': { 
                  borderColor: '#7a9c6a',
                  backgroundColor: '#9DC08B10'
                }
              }}
            >
              Back to Dashboard
            </Button>
          </Box>
        </Box>

        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search orders by ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#9DC08B',
                },
                '&:hover fieldset': {
                  borderColor: '#7a9c6a',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#40513B',
                },
              },
            }}
          />
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Orders Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Card>
            <CardContent sx={{ p: 0 }}>
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Order ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Total Price</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Date</TableCell>
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
                          <Typography variant="body2">
                            {order.first_name} {order.last_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            ৳{order.total_price?.toFixed(2) || order.total_price || '0.00'}
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
                          <Typography variant="body2" color="text.secondary">
                            {order.order_date ? new Date(order.order_date).toLocaleDateString() : ''}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <Dialog 
            open={modalOpen} 
            onClose={handleModalClose} 
            maxWidth="md" 
            fullWidth
            onOpen={() => console.log('Modal opened for order:', selectedOrder)}
          >
            <DialogTitle>
              <Typography variant="h6" component="div">
                Order Details - {selectedOrder.secure_order_id || `#${selectedOrder.id}`}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">Customer Information</Typography>
                  <Typography variant="body2">Name: {selectedOrder.first_name} {selectedOrder.last_name}</Typography>
                  <Typography variant="body2">Email: {selectedOrder.email}</Typography>
                  <Typography variant="body2">Phone: {selectedOrder.phone}</Typography>
                </Grid>
                <Grid xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">Order Information</Typography>
                  <Typography variant="body2">Total: ৳{selectedOrder.total_price?.toFixed(2) || selectedOrder.total_price}</Typography>
                  <Typography variant="body2">Status: {selectedOrder.status}</Typography>
                  <Typography variant="body2">Date: {selectedOrder.order_date ? new Date(selectedOrder.order_date).toLocaleDateString() : ''}</Typography>
                </Grid>
                <Grid xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">Order Items</Typography>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                        <div className="product-image-container" style={{ width: 50, height: 50, marginRight: 10 }}>
                          <img 
                            src={item.product_image} 
                            alt={item.product_name}
                            className="product-image-zoom"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                          />
                        </div>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="medium">{item.product_name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Quantity: {item.quantity} × ৳{item.price?.toFixed(2) || item.price}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No items found</Typography>
                  )}
                </Grid>
                <Grid xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">Shipping Address</Typography>
                  {selectedOrder.address ? (
                    <Typography variant="body2">
                      {selectedOrder.address.street}, {selectedOrder.address.city}, {selectedOrder.address.division}, {selectedOrder.address.country} {selectedOrder.address.postal_code}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No address found</Typography>
                  )}
                </Grid>
                
                {/* Delivery Assignment Information */}
                {selectedOrder.status === 'shipped' && (
                  <Grid xs={12}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Delivery Assignment
                    </Typography>
                    {deliveryAssignment ? (
                      <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
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
                      <Typography variant="body2" color="text.secondary">
                        No delivery assignment found
                      </Typography>
                    )}
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleModalClose} color="secondary">
                Close
              </Button>
              {selectedOrder.status === 'approved' && (
                <Button 
                  onClick={() => {
                    console.log('Opening shipping modal for order:', selectedOrder.id);
                    console.log('Current shipping data:', shippingData);
                    setShippingModalOpen(true);
                  }} 
                  variant="contained" 
                  color="primary"
                  startIcon={<LocalShippingIcon />}
                >
                  Mark as Shipped
                </Button>
              )}
              {selectedOrder.status === 'pending' && (
                <Button 
                  onClick={() => handleStatusUpdate('Approved')} 
                  variant="contained" 
                  color="success"
                  disabled={updatingStatus}
                >
                  {updatingStatus ? 'Updating...' : 'Approve Order'}
                </Button>
              )}
            </DialogActions>
          </Dialog>
        )}

        {/* Shipping Modal */}
        <Dialog 
          open={shippingModalOpen} 
          onClose={handleShippingModalClose} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6">
              Shipping Information & Rider Assignment
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>

              
              <Grid xs={12}>
                <Typography variant="h6" gutterBottom>
                  Shipping Information
                </Typography>
              </Grid>
              <Grid xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Courier Service</InputLabel>
                  <Select
                    value={shippingData.courier_service}
                    onChange={(e) => setShippingData({...shippingData, courier_service: e.target.value})}
                    label="Courier Service"
                  >
                    <MenuItem value="FedEx">FedEx</MenuItem>
                    <MenuItem value="UPS">UPS</MenuItem>
                    <MenuItem value="DHL">DHL</MenuItem>
                    <MenuItem value="USPS">USPS</MenuItem>
                    <MenuItem value="Amazon Logistics">Amazon Logistics</MenuItem>
                    <MenuItem value="Local Courier">Local Courier</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Tracking ID"
                  value={shippingData.tracking_id}
                  onChange={(e) => setShippingData({...shippingData, tracking_id: e.target.value})}
                  placeholder="Enter tracking ID from courier service"
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Estimated Delivery"
                  value={shippingData.estimated_delivery}
                  onChange={(e) => setShippingData({...shippingData, estimated_delivery: e.target.value})}
                  placeholder="e.g., 3-5 business days"
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes (Optional)"
                  value={shippingData.notes}
                  onChange={(e) => setShippingData({...shippingData, notes: e.target.value})}
                  placeholder="Additional shipping notes..."
                />
              </Grid>
              
              <Grid xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ color: '#40513B', fontWeight: 'bold' }}>
                  Rider Assignment
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Select a rider to handle the delivery for this order
                </Typography>

              </Grid>
              <Grid xs={12}>
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
              <Grid xs={12}>
                <FormControl fullWidth required error={!shippingData.rider_id}>
                  <InputLabel sx={{ color: !shippingData.rider_id ? '#d32f2f' : 'inherit' }}>
                    Select Rider *
                  </InputLabel>
                  <Select
                    value={shippingData.rider_id}
                    onChange={(e) => {
                      console.log('Rider selected:', e.target.value);
                      setShippingData({...shippingData, rider_id: e.target.value});
                    }}
                    label="Select Rider *"
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: !shippingData.rider_id ? '#d32f2f' : '#9DC08B',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: !shippingData.rider_id ? '#d32f2f' : '#7a9c6a',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: !shippingData.rider_id ? '#d32f2f' : '#40513B',
                      },
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
                <Box sx={{ mt: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Debug Info: Available Riders: {availableRiders.length}, Filtered: {filteredRiders.length}
                  </Typography>
                </Box>
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
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleShippingModalClose} color="secondary">
              Cancel
            </Button>
            <Button 
              onClick={handleAssignRider}
              variant="outlined" 
              color="primary"
              disabled={updatingStatus || !shippingData.rider_id}
              sx={{ mr: 1 }}
            >
              {updatingStatus ? 'Assigning...' : 'Assign Rider Only'}
            </Button>
            <Button 
              onClick={() => {
                console.log('Shipping data before update:', shippingData);
                console.log('Rider ID selected:', shippingData.rider_id);
                handleStatusUpdate('Shipped');
              }} 
              variant="contained" 
              color="primary"
              disabled={updatingStatus || !shippingData.courier_service || !shippingData.tracking_id || !shippingData.rider_id}
              startIcon={<LocalShippingIcon />}
              sx={{
                ...((!shippingData.courier_service || !shippingData.tracking_id || !shippingData.rider_id) && {
                  bgcolor: '#f5f5f5',
                  color: '#999',
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                    color: '#999'
                  }
                })
              }}
            >
              {updatingStatus ? 'Updating...' : 'Mark as Shipped'}
            </Button>
          </DialogActions>
        </Dialog>

      </Paper>
    </Box>
  );
};

export default AdminOrdersPage; 