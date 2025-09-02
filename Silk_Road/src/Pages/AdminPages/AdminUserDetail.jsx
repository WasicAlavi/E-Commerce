import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import {
  Box, Paper, Typography, Button, Card, CardContent, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customer, setCustomer] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);

  const handleRowClick = async (order) => {
    setOrderLoading(true);
    setSelectedOrder(order);
    setModalOpen(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${order.id}/with-items`);
      if (res.ok) {
        const data = await res.json();
        setOrderItems(data.data.items || []);
      } else {
        setOrderItems([]);
      }
    } catch {
      setOrderItems([]);
    } finally {
      setOrderLoading(false);
    }
  };
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedOrder(null);
    setOrderItems([]);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch user details
      const userRes = await fetch(`${API_BASE_URL}/users/${id}`);
      if (!userRes.ok) throw new Error('Failed to fetch user');
      const userData = await userRes.json();
      setUser(userData);

      // Fetch customer by user_id
      const customerRes = await fetch(`${API_BASE_URL}/customers/user/${id}`);
      const customerData = customerRes.ok ? await customerRes.json() : null;
      const customerObj = customerData?.data;
      setCustomer(customerObj);

      if (customerObj && customerObj.id) {
        // Fetch addresses
        const addrRes = await fetch(`${API_BASE_URL}/addresses/customer/${customerObj.id}`);
        const addrData = addrRes.ok ? await addrRes.json() : [];
        setAddresses(addrData || []);

        // Fetch orders
        const ordersRes = await fetch(`${API_BASE_URL}/orders/customer/${customerObj.id}`);
        const ordersData = ordersRes.ok ? await ordersRes.json() : { orders: [] };
        setOrders(ordersData.orders || ordersData || []);
      } else {
        setAddresses([]);
        setOrders([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #9DC08B 0%, #40513B 100%)', p: 3 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3, background: 'rgba(255,255,255,0.95)', mb: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/users')} sx={{ mb: 2, color: '#40513B' }}>Back to Users</Button>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <PeopleIcon sx={{ fontSize: 40, color: '#40513B' }} />
          <Typography variant="h4" fontWeight="bold" color="#40513B">User Details</Typography>
        </Box>
        {user && (
          <Box mb={2}>
            <Typography variant="h6">Name: {user.name || user.username}</Typography>
            <Typography variant="body1">Email: {user.email}</Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body1" component="span">Role:</Typography>
              <Chip label={user.role || 'customer'} color={user.role === 'admin' ? 'error' : 'default'} size="small" />
            </Box>
            <Typography variant="body1">User ID: {user.id}</Typography>
          </Box>
        )}
        <Box mb={2}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <HomeIcon sx={{ color: '#40513B' }} />
            <Typography variant="h6" color="#40513B">Addresses</Typography>
          </Box>
          {addresses.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No addresses found.</Typography>
          ) : (
            <Box display="flex" flexDirection="column" gap={1}>
              {addresses.map(addr => (
                <Paper key={addr.id} sx={{ p: 2, mb: 1, background: '#f8f9fa' }}>
                  <Typography variant="body2">{addr.street}, {addr.city}, {addr.division}, {addr.country}, {addr.postal_code}</Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <ShoppingCartIcon sx={{ color: '#40513B' }} />
            <Typography variant="h6" color="#40513B">Orders</Typography>
          </Box>
          {orders.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No orders found.</Typography>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 2, border: '1px solid #dee2e6' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Order ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id} hover sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f8f9fa' } }} onClick={() => handleRowClick(order)}>
                      <TableCell>{order.secure_order_id ? order.secure_order_id : 'N/A'}</TableCell>
                      <TableCell>{order.order_date ? new Date(order.order_date).toLocaleString() : ''}</TableCell>
                      <TableCell>৳{order.total_price?.toFixed(2) || order.total_price || '0.00'}</TableCell>
                      <TableCell>{order.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>
      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={modalOpen} onClose={handleModalClose} maxWidth="md" fullWidth>
          <DialogTitle>Order Details</DialogTitle>
          <DialogContent dividers>
            <Box mb={2}>
              <Typography variant="subtitle1" fontWeight="bold">Order ID: {selectedOrder.secure_order_id || `#${selectedOrder.id}`}</Typography>
              <Typography variant="body2">Date: {selectedOrder.order_date ? new Date(selectedOrder.order_date).toLocaleString() : ''}</Typography>
              <Typography variant="body2">Status: {selectedOrder.status}</Typography>
              <Typography variant="body2">Customer: {selectedOrder.first_name} {selectedOrder.last_name}</Typography>
              <Typography variant="body2">Email: {selectedOrder.email}</Typography>
              <Typography variant="body2">Phone: {selectedOrder.phone}</Typography>
              <Typography variant="body2">Total: ৳{selectedOrder.total_price?.toFixed(2) || selectedOrder.total_price || '0.00'}</Typography>
              {selectedOrder.transaction_id && (
                <Typography variant="body2">Transaction ID: {selectedOrder.transaction_id}</Typography>
              )}
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>Items:</Typography>
              {orderLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={80}><CircularProgress size={32} /></Box>
              ) : orderItems && orderItems.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderItems.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>৳{item.price?.toFixed(2) || item.price || '0.00'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="body2" color="text.secondary">No items found.</Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleModalClose} color="secondary">Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default AdminUserDetail; 