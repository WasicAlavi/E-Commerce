import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  LinearProgress,
  Avatar,
  Stack
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  Inventory,
  People,
  AttachMoney,
  ShoppingCart,
  Star,
  Refresh,
  Cancel,
  Analytics,
  Assessment,
  Timeline,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import analyticsService from '../../services/analyticsService';

const COLORS = ['#40513B', '#9DC08B', '#28a745', '#17a2b8', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14'];

const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(30);
  const [analyticsData, setAnalyticsData] = useState({
    sales: null,
    inventory: null,
    customers: null,
    performance: null,
    trends: null
  });

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [salesRes, inventoryRes, customersRes, performanceRes, trendsRes] = await Promise.allSettled([
        analyticsService.getSalesDashboard(timeRange),
        analyticsService.getInventoryAnalytics(),
        analyticsService.getCustomerSegmentation(),
        analyticsService.getPerformanceMetrics(),
        analyticsService.getTrendAnalysis()
      ]);

      setAnalyticsData({
        sales: salesRes.status === 'fulfilled' ? salesRes.value.data : null,
        inventory: inventoryRes.status === 'fulfilled' ? inventoryRes.value.data : null,
        customers: customersRes.status === 'fulfilled' ? customersRes.value.data : null,
        performance: performanceRes.status === 'fulfilled' ? performanceRes.value.data : null,
        trends: trendsRes.status === 'fulfilled' ? trendsRes.value.data : null
      });

      if (salesRes.status === 'rejected' && inventoryRes.status === 'rejected' && 
          customersRes.status === 'rejected' && performanceRes.status === 'rejected' && 
          trendsRes.status === 'rejected') {
        setError('Failed to load analytics data. Please try again.');
      }
    } catch (error) {
      setError('An error occurred while loading analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
        sx={{ 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: 3,
          mx: 2,
          my: 2
        }}
      >
        <CircularProgress size={80} sx={{ color: '#40513B', mb: 3 }} />
        <Typography variant="h6" color="#40513B" fontWeight={500}>
          Loading Analytics Dashboard...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Please wait while we gather your data
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 4, 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      {/* Header */}
      <Box 
        sx={{ 
          mb: 4,
          p: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.8)'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: '#40513B', width: 56, height: 56 }}>
              <Analytics sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700} color="#1a202c" sx={{ mb: 0.5 }}>
                Analytics Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                Comprehensive insights and performance metrics
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel sx={{ color: '#40513B', fontWeight: 500 }}>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#40513B' },
                    '&.Mui-focused fieldset': { borderColor: '#40513B' }
                  }
                }}
              >
                <MenuItem value={7}>Last 7 days</MenuItem>
                <MenuItem value={30}>Last 30 days</MenuItem>
                <MenuItem value={90}>Last 90 days</MenuItem>
                <MenuItem value={365}>Last year</MenuItem>
              </Select>
            </FormControl>
            <Tooltip title="Refresh Data" arrow>
              <IconButton 
                onClick={handleRefresh} 
                sx={{ 
                  color: '#40513B',
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  '&:hover': {
                    bgcolor: '#40513B',
                    color: '#ffffff',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 4, 
            borderRadius: 2,
            '& .MuiAlert-message': { fontWeight: 500 }
          }} 
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ 
        mb: 4, 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        borderRadius: 3,
        border: '1px solid rgba(255,255,255,0.8)',
        overflow: 'hidden'
      }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          sx={{ 
            borderBottom: '2px solid #e2e8f0',
            '& .MuiTab-root': {
              minHeight: 64,
              fontSize: '0.95rem',
              fontWeight: 600,
              textTransform: 'none',
              color: '#64748b',
              '&.Mui-selected': {
                color: '#40513B',
                fontWeight: 700
              }
            },
            '& .MuiTabs-indicator': {
              height: 3,
              backgroundColor: '#40513B'
            }
          }}
        >
          <Tab 
            label="Sales Analytics" 
            icon={<TrendingUp />} 
            iconPosition="start" 
          />
          <Tab 
            label="Inventory Management" 
            icon={<Inventory />} 
            iconPosition="start" 
          />
          <Tab 
            label="Customer Insights" 
            icon={<People />} 
            iconPosition="start" 
          />
          <Tab 
            label="Performance Metrics" 
            icon={<AttachMoney />} 
            iconPosition="start" 
          />
          <Tab 
            label="Trend Analysis" 
            icon={<Timeline />} 
            iconPosition="start" 
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid rgba(255,255,255,0.8)',
        overflow: 'hidden'
      }}>
        {activeTab === 0 && <SalesAnalytics data={analyticsData.sales} timeRange={timeRange} />}
        {activeTab === 1 && <InventoryAnalytics data={analyticsData.inventory} />}
        {activeTab === 2 && <CustomerAnalytics data={analyticsData.customers} />}
        {activeTab === 3 && <PerformanceAnalytics data={analyticsData.performance} />}
        {activeTab === 4 && <TrendAnalytics data={analyticsData.trends} />}
      </Box>
    </Box>
  );
};

// Sales Analytics Tab
const SalesAnalytics = ({ data, timeRange }) => {
  if (!data) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="info" sx={{ borderRadius: 2, fontSize: '1rem' }}>
          Sales data not available
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #40513B 0%, #9DC08B 100%)',
            boxShadow: '0 8px 32px rgba(64, 81, 59, 0.15)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ p: 3, color: '#ffffff' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" fontWeight={600} sx={{ opacity: 0.9 }}>
                  Total Sales
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                  <AttachMoney sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
              <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                ৳{(data.total_sales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 500 }}>
                Last {timeRange} days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #9DC08B 0%, #28a745 100%)',
            boxShadow: '0 8px 32px rgba(157, 192, 139, 0.15)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ p: 3, color: '#ffffff' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" fontWeight={600} sx={{ opacity: 0.9 }}>
                  Total Orders
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                  <ShoppingCart sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
              <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                {(data.total_orders || 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 500 }}>
                Orders placed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%)',
            boxShadow: '0 8px 32px rgba(23, 162, 184, 0.15)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ p: 3, color: '#ffffff' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" fontWeight={600} sx={{ opacity: 0.9 }}>
                  Avg Order Value
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                  <TrendingUp sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
              <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                ৳{(data.avg_order_value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 500 }}>
                Per order
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Daily Sales Chart */}
      <Grid item xs={12} lg={8}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" color="#40513B" gutterBottom sx={{ mb: 2 }}>
              Daily Sales Trend (Last {timeRange} Days)
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={data.daily_sales || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Revenue (৳)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                />
                <RechartsTooltip 
                  formatter={(value, name) => [`৳${value.toLocaleString()}`, 'Revenue']}
                  labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#40513B" 
                  fill="#40513B" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Top Products */}
      <Grid item xs={12} lg={4}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="h6" color="#40513B" gutterBottom>
              Top Selling Products
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {(data.top_products || []).slice(0, 5).map((product, index) => (
                <Box key={product.id} sx={{ mb: 2, p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {product.total_sold} units • ৳{product.revenue?.toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Box>
  );
};

// Inventory Analytics Tab
const InventoryAnalytics = ({ data }) => {
  if (!data) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="info" sx={{ borderRadius: 2, fontSize: '1rem' }}>
          Inventory data not available
        </Alert>
      </Box>
    );
  }

  // Debug logging
  console.log('Inventory Analytics Data:', data);
  console.log('Total Products:', data.total_products);
  console.log('Stock Distribution:', data.stock_distribution);
  console.log('Low Stock Products:', data.low_stock_products);

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'Out of Stock': return 'error';
      case 'Critical': return 'warning';
      case 'Low': return 'info';
      default: return 'success';
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Inventory Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #40513B 0%, #9DC08B 100%)',
            boxShadow: '0 8px 32px rgba(64, 81, 59, 0.15)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ p: 3, color: '#ffffff', textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                <Inventory sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                {data.total_products || 0}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Total Products
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #9DC08B 0%, #28a745 100%)',
            boxShadow: '0 8px 32px rgba(157, 192, 139, 0.15)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ p: 3, color: '#ffffff', textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                <AttachMoney sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                ৳{(data.total_stock_value || 0).toLocaleString()}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Total Stock Value
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
            boxShadow: '0 8px 32px rgba(255, 152, 0, 0.15)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ p: 3, color: '#ffffff', textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                <Warning sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                {data.low_stock_products?.length || 0}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Low Stock Items
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
            boxShadow: '0 8px 32px rgba(244, 67, 54, 0.15)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ p: 3, color: '#ffffff', textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                <Cancel sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                {(data.low_stock_products || []).filter(p => p.stock === 0).length}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Out of Stock
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Stock Distribution - Full Width */}
      <Grid item xs={12}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" color="#40513B" gutterBottom sx={{ mb: 2 }}>
              Stock Distribution by Product Count
            </Typography>
            <ResponsiveContainer width="100%" height={500}>
              <PieChart>
                <Pie
                  data={data.stock_distribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent, value }) => {
                    try {
                      // Safety check for undefined/null name or non-string values
                      if (!name || typeof name !== 'string') {
                        return `${value || 0} products\n${((percent || 0) * 100).toFixed(0)}%`;
                      }
                      
                      // Remove numbers from the beginning of the name (e.g., "0 Out of Stock" -> "Out of Stock")
                      const cleanName = name.replace(/^\d+\s*/, '');
                      // Create shorter labels for better visibility
                      const shortName = cleanName.length > 15 ? cleanName.substring(0, 12) + '...' : cleanName;
                      return `${shortName}\n${value || 0} products\n${((percent || 0) * 100).toFixed(0)}%`;
                    } catch (error) {
                      // Fallback in case of any error
                      console.warn('Error in pie chart label:', error);
                      return `${value || 0} products\n${((percent || 0) * 100).toFixed(0)}%`;
                    }
                  }}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="product_count"
                >
                  {(data.stock_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value, name, props) => [
                    `${value} products`, 
                    `${props.payload.stock_level}`
                  ]}
                  labelFormatter={(label) => `Stock Level: ${label}`}
                />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 3, p: 3, bgcolor: '#f8f9fa', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>What the numbers mean:</strong>
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    • <strong>Out of Stock:</strong> 0 items available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • <strong>Critical:</strong> 1-5 items remaining
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • <strong>Low:</strong> 6-10 items remaining
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    • <strong>Medium:</strong> 11-50 items remaining
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • <strong>High:</strong> 50+ items available
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Low Stock Alerts - Full Width */}
      <Grid item xs={12}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" color="#40513B" gutterBottom sx={{ mb: 2 }}>
              Low Stock Alerts (≤10 items)
            </Typography>
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {(data.low_stock_products || []).map((product) => (
                <Box key={product.id} sx={{ mb: 2, p: 2, border: '1px solid #dee2e6', borderRadius: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight="bold">
                      {product.name}
                    </Typography>
                    <Chip 
                      label={product.stock_status} 
                      color={getStockStatusColor(product.stock_status)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Stock: {product.stock} items • Price: ৳{product.price}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {product.stock === 0 ? '⚠️ Out of stock - immediate restock needed' :
                     product.stock <= 5 ? '🚨 Critical stock - restock urgently' :
                     '⚠️ Low stock - consider restocking soon'}
                  </Typography>
                </Box>
              ))}
              {(!data.low_stock_products || data.low_stock_products.length === 0) && (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    ✅ No low stock alerts
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    All products have sufficient stock levels
                  </Typography>
                </Box>
              )}
            </Box>
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Alert Levels:</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <strong>Out of Stock:</strong> 0 items (🚨 Immediate action required)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <strong>Critical:</strong> 1-5 items (⚠️ Restock urgently)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <strong>Low:</strong> 6-10 items (📊 Monitor closely)
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Fast Moving Products - Full Width */}
      <Grid item xs={12}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" color="#40513B" gutterBottom sx={{ mb: 2 }}>
              Fast Moving Products (Last 30 Days)
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Current Stock</TableCell>
                    <TableCell>Sold (30 days)</TableCell>
                    <TableCell>Stock Level</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data.fast_moving_products || []).map((product) => {
                    // Calculate stock level based on monthly demand
                    const monthlyDemand = product.sold_last_30_days || 1;
                    const stockLevel = Math.min((product.stock / monthlyDemand) * 100, 100);
                    
                    // Determine status based on stock level
                    let status = 'Good';
                    let statusColor = 'success';
                    if (stockLevel < 25) {
                      status = 'Critical';
                      statusColor = 'error';
                    } else if (stockLevel < 50) {
                      status = 'Low';
                      statusColor = 'warning';
                    } else if (stockLevel < 100) {
                      status = 'Medium';
                      statusColor = 'info';
                    }
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>{product.sold_last_30_days}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <LinearProgress 
                              variant="determinate" 
                              value={stockLevel}
                              sx={{ 
                                width: 100,
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: stockLevel < 25 ? '#f44336' : 
                                                 stockLevel < 50 ? '#ff9800' : 
                                                 stockLevel < 100 ? '#2196f3' : '#4caf50'
                                }
                              }}
                            />
                            <Typography variant="body2">
                              {stockLevel.toFixed(0)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={status} 
                            color={statusColor}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Stock Level Explanation:</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <strong>100%+:</strong> Stock covers 1+ months of demand (Good)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <strong>50-99%:</strong> Stock covers 2-4 weeks of demand (Medium)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <strong>25-49%:</strong> Stock covers 1-2 weeks of demand (Low)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <strong>&lt;25%:</strong> Stock covers less than 1 week of demand (Critical)
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Box>
  );
};

// Customer Analytics Tab
const CustomerAnalytics = ({ data }) => {
  if (!data) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="info" sx={{ borderRadius: 2, fontSize: '1rem' }}>
          Customer data not available
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={3}>
      {/* Customer Segments */}
      <Grid item xs={12} md={6}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" color="#40513B" gutterBottom sx={{ mb: 2 }}>
              Customer Segments by Spending
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.customer_segments || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="segment" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Number of Customers', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                />
                <RechartsTooltip 
                  formatter={(value, name) => [value, 'Customers']}
                  labelFormatter={(label) => `Segment: ${label}`}
                />
                <Bar 
                  dataKey="customer_count" 
                  fill="#40513B"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Customer Acquisition */}
      <Grid item xs={12} md={6}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" color="#40513B" gutterBottom sx={{ mb: 2 }}>
              Customer Acquisition (Last 90 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={data.customer_acquisition || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'New Customers', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                />
                <RechartsTooltip 
                  formatter={(value, name) => [value, 'New Customers']}
                  labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="new_customers" 
                  stroke="#9DC08B" 
                  strokeWidth={3}
                  dot={{ fill: '#9DC08B', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#40513B', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Top Customers */}
      <Grid item xs={12}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="h6" color="#40513B" gutterBottom>
              Top Customers by Revenue
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Total Orders</TableCell>
                    <TableCell>Total Spent</TableCell>
                    <TableCell>Avg Order Value</TableCell>
                    <TableCell>Last Order</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data.customer_behavior || []).slice(0, 10).map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>{customer.first_name} {customer.last_name}</TableCell>
                      <TableCell>{customer.total_orders}</TableCell>
                      <TableCell>৳{customer.total_spent?.toFixed(2)}</TableCell>
                      <TableCell>৳{customer.avg_order_value?.toFixed(2)}</TableCell>
                      <TableCell>
                        {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
      </Grid>
    </Box>
  );
};

// Performance Analytics Tab
const PerformanceAnalytics = ({ data }) => {
  if (!data) {
    return <Alert severity="info">Performance data not available</Alert>;
  }

  return (
    <Grid container spacing={3}>
      {/* Key Performance Indicators */}
      <Grid item xs={12} md={3}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="h6" color="#40513B" gutterBottom>
              Conversion Rate
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="#40513B">
              {data.conversion_rate?.toFixed(1) || 0}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Customer to order
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="h6" color="#9DC08B" gutterBottom>
              Revenue per Customer
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="#9DC08B">
              ৳{data.revenue_per_customer?.toFixed(2) || '0.00'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="h6" color="#17a2b8" gutterBottom>
              Return Customer Rate
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="#17a2b8">
              {data.return_customer_rate?.toFixed(1) || 0}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Repeat customers
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="h6" color="#ffc107" gutterBottom>
              Avg Order Value Trend
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="#ffc107">
              {data.avg_order_value_trends?.[data.avg_order_value_trends.length - 1]?.avg_order_value?.toFixed(2) || '0.00'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current trend
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* AOV Trends Chart */}
      <Grid item xs={12}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="h6" color="#40513B" gutterBottom>
              Average Order Value Trends (Last 30 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.avg_order_value_trends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="avg_order_value" stroke="#40513B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Trend Analytics Tab
const TrendAnalytics = ({ data }) => {
  if (!data) {
    return <Alert severity="info">Trend data not available</Alert>;
  }

  return (
    <Grid container spacing={3}>
      {/* Monthly Trends */}
      <Grid item xs={12} lg={8}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="h6" color="#40513B" gutterBottom>
              Monthly Sales Trends (Last 12 Months)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthly_trends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="revenue" fill="#40513B" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Category Performance */}
      <Grid item xs={12} lg={4}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="h6" color="#40513B" gutterBottom>
              Category Performance
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.category_performance || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {(data.category_performance || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Peak Hours Analysis */}
      <Grid item xs={12} md={6}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="h6" color="#40513B" gutterBottom>
              Peak Hours Analysis
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.peak_hours || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="orders" fill="#9DC08B" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Popular Products Monthly */}
      <Grid item xs={12} md={6}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="h6" color="#40513B" gutterBottom>
              Popular Products (Last 6 Months)
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {(data.popular_products_monthly || []).slice(0, 8).map((product, index) => (
                <Box key={index} sx={{ mb: 2, p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {product.total_sold} units in {new Date(product.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};



export default AnalyticsDashboard; 