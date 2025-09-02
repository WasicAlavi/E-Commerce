import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Button, 
  Box, 
  CircularProgress,
  Paper,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  AppBar,
  Toolbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import StarIcon from '@mui/icons-material/Star';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ShowChartIcon from '@mui/icons-material/ShowChart';

import ProductForm from '../../components/Admin/ProductForm';
import OrderTable from '../../components/Admin/OrderTable';
import StatsCards from '../../components/Admin/StatsCards';
import InventoryAlerts from '../../components/Admin/InventoryAlerts';
import { useAuth } from '../../AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import { getOrderStatusLabelAndColor } from '../../utils/orderStatusUtils';
import authService from '../../services/authService';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProductForm, setShowProductForm] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [carts, setCarts] = useState([]);
  const [errors, setErrors] = useState([]);

  const fetchDataWithErrorHandling = async (url, name) => {
    try {
      // Get auth token using authService
      const token = authService.getToken();
      
      const response = await fetch(url, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching ${name}:`, error);
      setErrors(prev => [...prev, `${name}: ${error.message}`]);
      return null;
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    setOrdersLoading(true);
    setErrors([]);
    
    try {
      // Fetch data that we know works first
      const orderStatsRes = await fetchDataWithErrorHandling('http://localhost:8000/api/v1/admin/orders/stats', 'Order Stats');
      const productsRes = await fetchDataWithErrorHandling('http://localhost:8000/api/v1/products/', 'Products');
      const ordersRes = await fetchDataWithErrorHandling('http://localhost:8000/api/v1/admin/orders', 'Orders');

      // Try to fetch other data but don't fail if they don't work
      let usersData = [];
      let reviewsData = [];
      let cartsData = [];

      // Get auth token for other requests
      const token = authService.getToken();
      const authHeaders = {
        'Authorization': token ? `Bearer ${token}` : '',
      };

      try {
        const usersRes = await fetch('http://localhost:8000/api/v1/users/', {
          headers: authHeaders
        });
        if (usersRes.ok) {
          usersData = await usersRes.json();
        }
      } catch (e) {
        console.log('Users endpoint not available, using fallback');
        usersData = [];
      }

      try {
        const reviewsRes = await fetch('http://localhost:8000/api/v1/reviews/', {
          headers: authHeaders
        });
        if (reviewsRes.ok) {
          reviewsData = await reviewsRes.json();
        }
      } catch (e) {
        console.log('Reviews endpoint not available, using fallback');
        reviewsData = { reviews: [], total: 0, average_rating: 0 };
      }

      try {
        const cartsRes = await fetch('http://localhost:8000/api/v1/carts/', {
          headers: authHeaders
        });
        if (cartsRes.ok) {
          cartsData = await cartsRes.json();
        }
      } catch (e) {
        console.log('Carts endpoint not available, using fallback');
        cartsData = { carts: [], total: 0 };
      }

      setUsers(usersData || []);
      setProducts(productsRes?.products || productsRes || []);
      setReviews(reviewsData?.reviews || reviewsData || []);
      setOrders(ordersRes?.data || []);
      console.log('Sample order:', (ordersRes?.data || [])[0]);
      setCarts(cartsData?.carts || cartsData || []);

      // Calculate additional stats with fallbacks
      const totalUsers = usersData?.length || 0;
      const totalProducts = productsRes?.total || productsRes?.length || 0;
      const totalReviews = reviewsData?.total || reviewsData?.length || 0;
      const totalCarts = cartsData?.carts?.length || cartsData?.length || 0;

      // Calculate average rating
      const avgRating = reviewsData?.average_rating || 0;

      setStats({
        totalOrders: orderStatsRes?.data?.total_orders || 0,
        totalRevenue: orderStatsRes?.data?.total_revenue || 0,
        recentOrders: orderStatsRes?.data?.recent_orders || 0,
        statusBreakdown: orderStatsRes?.data?.status_breakdown || {},
        totalUsers,
        totalProducts,
        totalReviews,
        totalCarts,
        averageRating: avgRating,
        pendingOrders: orderStatsRes?.data?.status_breakdown?.pending || orderStatsRes?.data?.status_breakdown?.Pending || 0,
        processingOrders: orderStatsRes?.data?.status_breakdown?.processing || orderStatsRes?.data?.status_breakdown?.Processing || 0,
        shippedOrders: orderStatsRes?.data?.status_breakdown?.shipped || orderStatsRes?.data?.status_breakdown?.Shipped || 0,
        deliveredOrders: orderStatsRes?.data?.status_breakdown?.delivered || orderStatsRes?.data?.status_breakdown?.Delivered || 0,
        cancelledOrders: orderStatsRes?.data?.status_breakdown?.cancelled || orderStatsRes?.data?.status_breakdown?.Cancelled || 0,
        lastMonthRevenue: orderStatsRes?.data?.lastMonthRevenue || 0,
      });
    } catch (err) {
      console.error('Error in fetchAllData:', err);
      setErrors(prev => [...prev, `General error: ${err.message}`]);
      // Set default stats if everything fails
      setStats({
        totalOrders: 0,
        totalRevenue: 0,
        recentOrders: 0,
        statusBreakdown: {},
        totalUsers: 0,
        totalProducts: 0,
        totalReviews: 0,
        totalCarts: 0,
        averageRating: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0
      });
    } finally {
      setLoading(false);
      setOrdersLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      // Get auth token using authService
      const token = authService.getToken();
      
      const res = await fetch('http://localhost:8000/api/v1/admin/orders', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setOrders(data.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setErrors(prev => [...prev, `Orders: ${err.message}`]);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAllData();
  }, [user, navigate]);

  const handleRefresh = () => {
    setErrors([]);
    fetchAllData();
    fetchOrders();
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #9DC08B 0%, #40513B 100%)', p: 0 }}>
      {/* Admin Header */}
      <AppBar position="static" sx={{ background: '#40513B', boxShadow: 2 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <img src="/logo4.png" alt="Logo" style={{ height: 40, borderRadius: 8 }} />
            <Typography variant="h6" fontWeight="bold" color="#fff">
              Admin Dashboard
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="#fff">
              {user?.name || user?.username || 'Admin'}
            </Typography>
            <IconButton color="inherit" onClick={() => { logout(); navigate('/login'); }}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box display="flex" alignItems="center" gap={2}>
              <DashboardIcon sx={{ fontSize: 40, color: '#40513B' }} />
              <Typography variant="h4" fontWeight="bold" color="#40513B">
                Admin Dashboard
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              <Tooltip title="Refresh Data">
                <span>
                  <IconButton 
                    onClick={handleRefresh} 
                    disabled={loading}
                    sx={{ 
                      color: '#40513B',
                      '&:hover': { backgroundColor: '#9DC08B20' }
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Button 
                variant="outlined"
                startIcon={<AnalyticsIcon />} 
                onClick={() => navigate('/admin/analytics')}
                sx={{ 
                  borderColor: '#40513B',
                  color: '#40513B',
                  '&:hover': { 
                    borderColor: '#2d3a2a',
                    backgroundColor: '#40513B10'
                  },
                  borderRadius: 2,
                  px: 3
                }}
              >
                Analytics
              </Button>
              <Button 
                variant="outlined"
                startIcon={<ShowChartIcon />} 
                onClick={() => navigate('/admin/advanced-analytics')}
                sx={{ 
                  borderColor: '#9DC08B',
                  color: '#9DC08B',
                  '&:hover': { 
                    borderColor: '#7a9c6a',
                    backgroundColor: '#9DC08B10'
                  },
                  borderRadius: 2,
                  px: 3
                }}
              >
                Advanced Analytics
              </Button>
              <Button 
                variant="outlined"
                startIcon={<LocalShippingIcon />} 
                onClick={() => navigate('/admin/riders')}
                sx={{ 
                  borderColor: '#40513B',
                  color: '#40513B',
                  '&:hover': { 
                    borderColor: '#2d3a2a',
                    backgroundColor: '#40513B10'
                  },
                  borderRadius: 2,
                  px: 3
                }}
              >
                Rider Management
              </Button>

              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={() => setShowProductForm(true)}
                sx={{ 
                  backgroundColor: '#40513B',
                  '&:hover': { backgroundColor: '#2d3a2a' },
                  borderRadius: 2,
                  px: 3
                }}
              >
                Add Product
              </Button>
            </Box>
          </Box>

          {/* Error Messages */}
          {errors.length > 0 && (
            <Alert severity="info" sx={{ mb: 3 }} onClose={() => setErrors([])}>
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                Some features are not available:
              </Typography>
              {errors.map((error, index) => (
                <Typography key={index} variant="body2" color="text.secondary">
                  • {error}
                </Typography>
              ))}
              <Typography variant="body2" color="text.secondary" mt={1}>
                The dashboard will show available data. Some endpoints may need database setup.
              </Typography>
            </Alert>
          )}

          {/* Stats Section */}
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
              <CircularProgress size={60} sx={{ color: '#40513B' }} />
            </Box>
          ) : (
            <>
              <StatsCards stats={stats} />
              
              {/* Inventory Alerts */}
              <InventoryAlerts />
              
              {/* Orders Section */}
              <Card sx={{ 
                mb: 4,
                border: '1px solid #dee2e6',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" fontWeight="bold" color="#40513B">
                      Order Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {orders.length} orders found
                    </Typography>
                  </Box>
                  {ordersLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                      <CircularProgress sx={{ color: '#40513B' }} />
                    </Box>
                  ) : orders.length === 0 ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
                      <Typography variant="body2" color="text.secondary">
                        No orders found.
                      </Typography>
                    </Box>
                  ) : (
                    <OrderTable orders={orders} onOrderUpdate={fetchOrders} />
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity Summary */}
              <Grid container spacing={3}>
                <Grid columns={12} gridColumn="span 6">
                  <Card sx={{ 
                    border: '1px solid #dee2e6',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" color="#40513B" mb={2}>
                        Recent Orders
                      </Typography>
                      {orders.slice(0, 5).map((order) => {
                        const { label, color } = getOrderStatusLabelAndColor(order.status);
                        return (
                          <Box key={order.id} mb={2} p={2} bgcolor="#f8f9fa" borderRadius={1}>
                            <Typography variant="body2" fontWeight="bold">
                              Order #{order.id} - {order.first_name} {order.last_name}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2" color="text.secondary">
                                ৳{order.total_price} •
                              </Typography>
                              <Chip label={label} color={color} size="small" />
                            </Box>
                          </Box>
                        );
                      })}
                      {orders.length === 0 && (
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                          No orders found
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid columns={12} gridColumn="span 6">
                  <Card sx={{ 
                    border: '1px solid #dee2e6',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" color="#40513B" mb={2}>
                        System Overview
                      </Typography>
                      <Box display="flex" flexDirection="column" gap={1}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Active Carts:</Typography>
                          <Typography variant="body2" fontWeight="bold">{stats?.totalCarts || 0}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Average Rating:</Typography>
                          <Typography variant="body2" fontWeight="bold">{stats?.averageRating?.toFixed(1) || 0}/5</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Pending Orders:</Typography>
                          <Typography variant="body2" fontWeight="bold" color="warning.main">{stats?.pendingOrders || 0}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Processing Orders:</Typography>
                          <Typography variant="body2" fontWeight="bold" color="info.main">{stats?.processingOrders || 0}</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </>
          )}

          {/* Product Form Modal */}
          {showProductForm && (
            <ProductForm onClose={() => setShowProductForm(false)} onSuccess={fetchAllData} />
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminDashboard; 