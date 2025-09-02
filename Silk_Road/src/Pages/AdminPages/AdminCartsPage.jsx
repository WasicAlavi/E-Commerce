import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useAuth } from '../../AuthContext';
import authService from '../../services/authService';

const AdminCartsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCart, setSelectedCart] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchCarts();
  }, [user, navigate]);

  const fetchCarts = async () => {
    setLoading(true);
    setError('');
    try {
      const token = authService.getToken();
      const response = await fetch('http://localhost:8000/api/v1/carts/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch carts');
      const data = await response.json();
      setCarts(data.data.carts || []);
    } catch (err) {
      setError('Failed to load carts. Please try again.');
      setCarts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (cart) => {
    setSelectedCart(cart);
    setModalOpen(true);
    setItemsLoading(true);
    try {
      const token = authService.getToken();
      const res = await fetch(`http://localhost:8000/api/v1/carts/${cart.id}/items-with-products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCartItems(data.data || []);
      } else {
        setCartItems([]);
      }
    } catch {
      setCartItems([]);
    } finally {
      setItemsLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedCart(null);
    setCartItems([]);
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #9DC08B 0%, #40513B 100%)',
      p: 3
    }}>
      <Paper sx={{
        p: 4,
        borderRadius: 3,
        boxShadow: 3,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box display="flex" alignItems="center" gap={2}>
            <ShoppingCartIcon sx={{ fontSize: 40, color: '#40513B' }} />
            <Typography variant="h4" fontWeight="bold" color="#40513B">
              Cart Management
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => navigate('/admin')}
            sx={{
              borderColor: '#40513B',
              color: '#40513B',
              '&:hover': {
                borderColor: '#2d3a2a',
                backgroundColor: '#9DC08B20'
              }
            }}
          >
            Back to Dashboard
          </Button>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Carts Table */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress size={60} sx={{ color: '#40513B' }} />
          </Box>
        ) : (
          <Card sx={{
            border: '1px solid #dee2e6',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold" color="#40513B">
                  All Carts ({carts.length})
                </Typography>
                <Button
                  variant="contained"
                  onClick={fetchCarts}
                  sx={{
                    backgroundColor: '#40513B',
                    '&:hover': { backgroundColor: '#2d3a2a' }
                  }}
                >
                  Refresh
                </Button>
              </Box>

              {carts.length === 0 ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                  <Typography variant="h6" color="text.secondary">
                    No carts found
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{
                  boxShadow: 2,
                  border: '1px solid #dee2e6',
                  maxHeight: 500,
                  overflow: 'auto'
                }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                        <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Cart ID</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>User</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Items</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Total Price</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Creation Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {carts.map((cart) => (
                        <TableRow key={cart.id} hover sx={{ '&:hover': { backgroundColor: '#f8f9fa' }, cursor: 'pointer' }} onClick={() => handleRowClick(cart)}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              #{cart.id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {cart.customer_name || 'Unknown'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {cart.total_items || 0} items
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold" color="#40513B">
                              ৳{(cart.total_price || 0).toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={cart.is_deleted ? 'Deleted' : 'Active'}
                              color={cart.is_deleted ? 'error' : 'success'}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: cart.is_deleted ? '#dc3545' : '#28a745',
                                color: cart.is_deleted ? '#dc3545' : '#28a745'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {cart.creation_date ? new Date(cart.creation_date).toLocaleDateString() : ''}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        )}
        {/* Cart Items Modal */}
        {selectedCart && (
          <Dialog open={modalOpen} onClose={handleModalClose} maxWidth="md" fullWidth>
            <DialogTitle>Cart Items for Cart #{selectedCart.id}</DialogTitle>
            <DialogContent dividers>
              {itemsLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
                  <CircularProgress size={32} />
                </Box>
              ) : cartItems && cartItems.length > 0 ? (
                <>
                  <Box mb={2} display="flex" justifyContent="space-between">
                    <Typography variant="subtitle1">Items: <b>{cartItems.length}</b></Typography>
                    <Typography variant="subtitle1">Total Price: <b>৳{cartItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0).toFixed(2)}</b></Typography>
                  </Box>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cartItems.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            {item.product_image && (
                              <img src={item.product_image} alt={item.product_name} style={{ width: 40, height: 40, objectFit: 'cover', marginRight: 8, borderRadius: 4 }} />
                            )}
                            {item.product_name}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>৳{item.product_price?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell>৳{(item.product_price * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right"><b>Total</b></TableCell>
                        <TableCell>
                          <b>
                            ৳{cartItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0).toFixed(2)}
                          </b>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">No items found in this cart.</Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleModalClose} color="secondary">Close</Button>
            </DialogActions>
          </Dialog>
        )}
      </Paper>
    </Box>
  );
};

export default AdminCartsPage; 