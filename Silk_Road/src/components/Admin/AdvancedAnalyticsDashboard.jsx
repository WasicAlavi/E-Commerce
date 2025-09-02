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
  Button,
  Divider,
  LinearProgress,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
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
  Visibility,
  LocalShipping,
  CheckCircle,
  Cancel,
  LocationOn,
  Campaign,
  Analytics,
  Psychology,
  Timeline,
  Map,
  Assessment,
  Business,
  ShowChart,
  Speed,
  Notifications
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
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ComposedChart
} from 'recharts';
import advancedAnalyticsService from '../../services/advancedAnalyticsService';

const COLORS = ['#40513B', '#9DC08B', '#28a745', '#17a2b8', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14'];

const AdvancedAnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(30);
  const [analyticsData, setAnalyticsData] = useState({
    geographic: null,
    product: null,
    marketing: null,
    customer: null,
    predictive: null,
    realTime: null,
    summary: null
  });

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [geographicRes, productRes, marketingRes, customerRes, predictiveRes, realTimeRes, summaryRes] = 
        await Promise.allSettled([
          advancedAnalyticsService.getGeographicAnalytics(),
          advancedAnalyticsService.getProductAnalytics(),
          advancedAnalyticsService.getMarketingAnalytics(),
          advancedAnalyticsService.getCustomerAnalytics(),
          advancedAnalyticsService.getPredictiveAnalytics(),
          advancedAnalyticsService.getRealTimeAnalytics(),
          advancedAnalyticsService.getAnalyticsSummary()
        ]);

      setAnalyticsData({
        geographic: geographicRes.status === 'fulfilled' ? geographicRes.value.data : null,
        product: productRes.status === 'fulfilled' ? productRes.value.data : null,
        marketing: marketingRes.status === 'fulfilled' ? marketingRes.value.data : null,
        customer: customerRes.status === 'fulfilled' ? customerRes.value.data : null,
        predictive: predictiveRes.status === 'fulfilled' ? predictiveRes.value.data : null,
        realTime: realTimeRes.status === 'fulfilled' ? realTimeRes.value.data : null,
        summary: summaryRes.status === 'fulfilled' ? summaryRes.value.data : null
      });

      if (geographicRes.status === 'rejected' && productRes.status === 'rejected' && 
          marketingRes.status === 'rejected' && customerRes.status === 'rejected' &&
          predictiveRes.status === 'rejected' && realTimeRes.status === 'rejected') {
        setError('Failed to load analytics data');
      }
    } catch (error) {
      setError('Error fetching analytics data');
      console.error('Analytics fetch error:', error);
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress size={60} sx={{ color: '#40513B' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Header */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold" color="#40513B">
          Advanced Analytics Dashboard
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value={7}>Last 7 days</MenuItem>
              <MenuItem value={30}>Last 30 days</MenuItem>
              <MenuItem value={90}>Last 90 days</MenuItem>
              <MenuItem value={365}>Last year</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} sx={{ color: '#40513B' }}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      {analyticsData.summary && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={3}>
            <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="h6" color="#40513B" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="#40513B">
                  ৳{analyticsData.summary.summary?.total_revenue?.toFixed(2) || '0.00'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {analyticsData.summary.growth?.revenue_growth_percent?.toFixed(1) || 0}% from last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="h6" color="#9DC08B" gutterBottom>
                  Total Orders
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="#9DC08B">
                  {analyticsData.summary.summary?.total_orders || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {analyticsData.summary.growth?.order_growth_percent?.toFixed(1) || 0}% from last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="h6" color="#17a2b8" gutterBottom>
                  Total Customers
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="#17a2b8">
                  {analyticsData.summary.summary?.total_customers || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {analyticsData.summary.growth?.customer_growth_percent?.toFixed(1) || 0}% from last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="h6" color="#ffc107" gutterBottom>
                  Avg Order Value
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="#ffc107">
                  ৳{analyticsData.summary.summary?.avg_order_value?.toFixed(2) || '0.00'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Per order average
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3, backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Geographic Analytics" icon={<Map />} iconPosition="start" />
          <Tab label="Product Analytics" icon={<Inventory />} iconPosition="start" />
          <Tab label="Marketing Analytics" icon={<Campaign />} iconPosition="start" />
          <Tab label="Customer Analytics" icon={<People />} iconPosition="start" />
          <Tab label="Predictive Analytics" icon={<Psychology />} iconPosition="start" />
          <Tab label="Real-time Analytics" icon={<Speed />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && <GeographicAnalytics data={analyticsData.geographic} />}
      {activeTab === 1 && <ProductAnalytics data={analyticsData.product} />}
      {activeTab === 2 && <MarketingAnalytics data={analyticsData.marketing} />}
      {activeTab === 3 && <CustomerAnalytics data={analyticsData.customer} />}
      {activeTab === 4 && <PredictiveAnalytics data={analyticsData.predictive} />}
      {activeTab === 5 && <RealTimeAnalytics data={analyticsData.realTime} />}
    </Box>
  );
};

// Geographic Analytics Tab
const GeographicAnalytics = ({ data }) => {
  if (!data) {
    return <Alert severity="info">Geographic data not available</Alert>;
  }

  const hasCustomerData = data.customer_distribution && data.customer_distribution.length > 0;
  const hasRegionalData = data.regional_sales && data.regional_sales.length > 0;
  const hasCountryData = data.country_analytics && data.country_analytics.length > 0;
  const hasCityData = data.city_orders && data.city_orders.length > 0;

  return (
    <Grid container spacing={4}>
      {/* Geographic Summary */}
      <Grid item xs={12}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="h6" color="#40513B" gutterBottom>
              Geographic Analytics Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Total Cities</Typography>
                <Typography variant="h6" color="#40513B">{hasCustomerData ? data.customer_distribution.length : 0}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Total Regions</Typography>
                <Typography variant="h6" color="#40513B">{hasRegionalData ? data.regional_sales.length : 0}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Countries</Typography>
                <Typography variant="h6" color="#40513B">{hasCountryData ? data.country_analytics.length : 0}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Active Cities</Typography>
                <Typography variant="h6" color="#40513B">{hasCityData ? data.city_orders.length : 0}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Customer Distribution by City */}
      <Grid item xs={12} lg={4}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" color="#40513B" gutterBottom sx={{ mb: 2 }}>
              Customer Distribution by City
            </Typography>
            {hasCustomerData ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.customer_distribution || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="location" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    label={{ value: 'Number of Customers', angle: -90, position: 'insideLeft' }}
                    tick={{ fontSize: 12 }}
                  />
                  <RechartsTooltip 
                    formatter={(value, name) => [value, 'Customers']}
                    labelFormatter={(label) => `City: ${label}`}
                  />
                  <Bar 
                    dataKey="customer_count" 
                    fill="#40513B"
                    name="Customers"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No customer distribution data available
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Regional Sales Performance */}
      <Grid item xs={12} lg={8}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" color="#40513B" gutterBottom sx={{ mb: 2 }}>
              Regional Sales Performance
            </Typography>
            {hasRegionalData ? (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={data.regional_sales || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ region, revenue_percentage }) => `${region}: ${revenue_percentage?.toFixed(1) || 0}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="revenue_percentage"
                    nameKey="region"
                  >
                    {(data.regional_sales || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value, name, props) => [`${value?.toFixed(1) || 0}%`, 'Revenue Share']}
                    labelFormatter={(label) => `Region: ${label}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No regional sales data available
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Country Analytics */}
      <Grid item xs={12} md={6}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="h6" color="#40513B" gutterBottom>
              Country-wise Sales Analytics
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Country</TableCell>
                    <TableCell>Customers</TableCell>
                    <TableCell>Orders</TableCell>
                    <TableCell>Revenue</TableCell>
                    <TableCell>Avg Order Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data.country_analytics || []).map((country) => (
                    <TableRow key={country.country}>
                      <TableCell>{country.country}</TableCell>
                      <TableCell>{country.customer_count}</TableCell>
                      <TableCell>{country.total_orders}</TableCell>
                      <TableCell>৳{country.total_revenue?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>৳{country.avg_order_value?.toFixed(2) || '0.00'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* City Orders */}
      <Grid item xs={12} md={6}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="h6" color="#40513B" gutterBottom>
              City-wise Order Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.city_orders || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="city" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  label={{ value: 'Total Orders', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 12 }}
                />
                <RechartsTooltip 
                  formatter={(value, name) => [value, 'Orders']}
                  labelFormatter={(label) => `City: ${label}`}
                />
                <Bar 
                  dataKey="total_orders" 
                  fill="#9DC08B"
                  name="Orders"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Product Analytics Tab
const ProductAnalytics = ({ data }) => {
  if (!data) {
    return <Alert severity="info">Product analytics data not available</Alert>;
  }

  const hasProductMatrix = data.product_matrix && data.product_matrix.length > 0;
  const hasInventoryData = data.inventory_turnover && data.inventory_turnover.length > 0;
  const hasAffinityData = data.product_affinity && data.product_affinity.length > 0;

  return (
    <Grid container spacing={4}>
      {/* Product Performance Matrix */}
      <Grid item xs={12}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="h6" color="#40513B" gutterBottom>
              Product Performance Matrix (BCG Style)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <strong>BCG Categories:</strong> 
              <strong style={{color: '#28a745'}}>Star</strong> (High views, High profit) • 
              <strong style={{color: '#ffc107'}}>Question Mark</strong> (High views, Low profit) • 
              <strong style={{color: '#17a2b8'}}>Cash Cow</strong> (Low views, High profit) • 
              <strong style={{color: '#dc3545'}}>Low Performance</strong> (Low views, Low profit)
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Views</TableCell>
                    <TableCell>Purchases</TableCell>
                    <TableCell>Revenue</TableCell>
                    <TableCell>Profit Margin</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Conversion Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data.product_matrix || []).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.views}</TableCell>
                      <TableCell>{product.purchase_count}</TableCell>
                      <TableCell>৳{product.revenue?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>{(product.profit_margin * 100)?.toFixed(1) || 0}%</TableCell>
                      <TableCell>
                        <Chip 
                          label={product.category} 
                          color={
                            product.category === 'Star' ? 'success' :
                            product.category === 'Cash Cow' ? 'primary' :
                            product.category === 'Question Mark' ? 'warning' : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{(product.conversion_rate * 100)?.toFixed(1) || 0}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Inventory Turnover */}
      <Grid item xs={12} md={6}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="h6" color="#40513B" gutterBottom>
              Inventory Turnover Analysis
            </Typography>
            {hasInventoryData ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.inventory_turnover || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    label={{ value: 'Inventory Turnover Rate', angle: -90, position: 'insideLeft' }}
                    tick={{ fontSize: 12 }}
                  />
                  <RechartsTooltip 
                    formatter={(value, name) => [value?.toFixed(2) || 0, 'Turnover Rate']}
                    labelFormatter={(label) => `Product: ${label}`}
                  />
                  <Bar 
                    dataKey="inventory_turnover" 
                    fill="#9DC08B"
                    name="Turnover Rate"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No inventory turnover data available
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Product Affinity */}
      <Grid item xs={12} md={6}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="h6" color="#40513B" gutterBottom>
              Product Affinity Analysis
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {(data.product_affinity || []).map((affinity, index) => (
                <Box key={index} sx={{ mb: 2, p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {affinity.product1_name} + {affinity.product2_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bought together {affinity.frequency} times
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

// Marketing Analytics Tab
const MarketingAnalytics = ({ data }) => {
  if (!data) {
    return <Alert severity="info">Marketing analytics data not available</Alert>;
  }

  return (
    <Grid container spacing={4}>
      {/* Campaign Performance */}
      <Grid item xs={12} lg={8}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="h6" color="#40513B" gutterBottom>
              Campaign Performance
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.campaign_performance || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="conversion_source" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="revenue" fill="#40513B" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Customer Acquisition by Source */}
      <Grid item xs={12} lg={4}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="h6" color="#40513B" gutterBottom>
              Customer Acquisition by Source
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={data.acquisition_by_source || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ source, new_customers }) => `${source}: ${new_customers}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="new_customers"
                >
                  {(data.acquisition_by_source || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Device Analytics */}
      <Grid item xs={12}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="h6" color="#40513B" gutterBottom>
              Device and Browser Analytics
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Device Type</TableCell>
                    <TableCell>Browser</TableCell>
                    <TableCell>Operating System</TableCell>
                    <TableCell>Orders</TableCell>
                    <TableCell>Revenue</TableCell>
                    <TableCell>Avg Order Value</TableCell>
                    <TableCell>Avg Time on Site</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data.device_analytics || []).map((device, index) => (
                    <TableRow key={index}>
                      <TableCell>{device.device_type}</TableCell>
                      <TableCell>{device.browser}</TableCell>
                      <TableCell>{device.operating_system}</TableCell>
                      <TableCell>{device.orders}</TableCell>
                      <TableCell>৳{device.revenue?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>৳{device.avg_order_value?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>{device.avg_time_on_site?.toFixed(0) || 0} seconds</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Customer Analytics Tab
const CustomerAnalytics = ({ data }) => {
  if (!data) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="info" sx={{ borderRadius: 2, fontSize: '1rem' }}>
          Customer analytics data not available
        </Alert>
      </Box>
    );
  }

  // Filter out customers with no orders for better visualization
  const customersWithOrders = (data.clv_analysis || []).filter(customer => customer.lifetime_value > 0);

  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={4}>
        {/* Customer Lifetime Value Analysis */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            backgroundColor: '#ffffff', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
            border: '1px solid #e0e0e0',
            borderRadius: 3
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" color="#40513B" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Customer Lifetime Value Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Top customers by total spending value. Shows the most valuable customers for targeted marketing.
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={customersWithOrders.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="first_name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Lifetime Value (৳)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                  />
                  <RechartsTooltip 
                    formatter={(value, name) => [`৳${value.toLocaleString()}`, 'Lifetime Value']}
                    labelFormatter={(label) => `Customer: ${label}`}
                  />
                  <Bar 
                    dataKey="lifetime_value" 
                    fill="#40513B"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Segments */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ 
            backgroundColor: '#ffffff', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
            border: '1px solid #e0e0e0',
            borderRadius: 3
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" color="#40513B" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Customer Segments
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Customer segmentation based on total spending:
                <br />• <strong style={{color: '#d32f2f'}}>VIP</strong> (৳10,000+)
                <br />• <strong style={{color: '#f57c00'}}>Premium</strong> (৳5,000-9,999)
                <br />• <strong style={{color: '#1976d2'}}>Regular</strong> (৳1,000-4,999)
                <br />• <strong style={{color: '#388e3c'}}>New</strong> (&lt;৳1,000)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.customer_segments || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ segment, customer_count }) => `${segment}\n${customer_count} customers`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="customer_count"
                  >
                    {(data.customer_segments || []).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.segment === 'VIP' ? '#d32f2f' :
                          entry.segment === 'Premium' ? '#f57c00' :
                          entry.segment === 'Regular' ? '#1976d2' : '#388e3c'
                        } 
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value, name) => [`${value} customers`, 'Count']}
                    labelFormatter={(label) => `${label} Segment`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Behavior Patterns */}
        <Grid item xs={12}>
          <Card sx={{ 
            backgroundColor: '#ffffff', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
            border: '1px solid #e0e0e0',
            borderRadius: 3
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" color="#40513B" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Customer Behavior Patterns
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Customer categorization based on order frequency and spending patterns:
                <br />• <strong style={{color: '#d32f2f'}}>Loyal</strong> (20+ orders) - Most valuable customers
                <br />• <strong style={{color: '#f57c00'}}>Regular</strong> (6-20 orders) - Consistent buyers
                <br />• <strong style={{color: '#1976d2'}}>Occasional</strong> (2-5 orders) - Occasional buyers
                <br />• <strong style={{color: '#388e3c'}}>One-time</strong> (1 order) - First-time buyers
                <br />• <strong style={{color: '#757575'}}>No Orders</strong> - Registered but haven't purchased
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Behavior Pattern</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Customer Count</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Avg Lifetime Value</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Avg Order Value</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Avg Days Since Last Order</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(data.behavior_patterns || []).map((pattern) => (
                      <TableRow key={pattern.behavior_pattern} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                        <TableCell>
                          <Chip 
                            label={pattern.behavior_pattern} 
                            color={
                              pattern.behavior_pattern === 'Loyal' ? 'error' :
                              pattern.behavior_pattern === 'Regular' ? 'warning' :
                              pattern.behavior_pattern === 'Occasional' ? 'primary' :
                              pattern.behavior_pattern === 'One-time' ? 'success' : 'default'
                            }
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{pattern.customer_count}</TableCell>
                        <TableCell sx={{ fontWeight: 500, color: '#40513B' }}>
                          ৳{pattern.avg_lifetime_value?.toLocaleString() || '0'}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          ৳{pattern.avg_order_value?.toLocaleString() || '0'}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {pattern.avg_days_since_order?.toFixed(0) || 0} days
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

// Predictive Analytics Tab
const PredictiveAnalytics = ({ data }) => {
  const [churnFilter, setChurnFilter] = useState('all');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  if (!data) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="info" sx={{ borderRadius: 2, fontSize: '1rem' }}>
          Predictive analytics data not available
        </Alert>
      </Box>
    );
  }

  // Filter customers based on selected filters
  const filteredCustomers = (data.churn_prediction || []).filter(customer => {
    const matchesChurnFilter = churnFilter === 'all' || customer.churn_risk === churnFilter;
    const matchesSegmentFilter = segmentFilter === 'all' || customer.customer_segment === segmentFilter;
    return matchesChurnFilter && matchesSegmentFilter;
  });

  // Get unique risk levels and segments for filters
  const riskLevels = [...new Set((data.churn_prediction || []).map(c => c.churn_risk))];
  const segments = [...new Set((data.churn_prediction || []).map(c => c.customer_segment))];

  // Pagination
  const paginatedCustomers = filteredCustomers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={4}>
        {/* Sales Forecast */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            backgroundColor: '#ffffff', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
            border: '1px solid #e0e0e0',
            borderRadius: 3
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" color="#40513B" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Sales Forecast & Trend Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Monthly revenue trends and growth predictions based on historical data.
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.sales_forecast || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Revenue (৳)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                  />
                  <RechartsTooltip 
                    formatter={(value, name) => [`৳${value.toLocaleString()}`, 'Revenue']}
                    labelFormatter={(label) => `Month: ${new Date(label).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#40513B" 
                    strokeWidth={3}
                    dot={{ fill: '#40513B', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Churn Risk Analysis */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            backgroundColor: '#ffffff', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
            border: '1px solid #e0e0e0',
            borderRadius: 3
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" color="#40513B" sx={{ fontWeight: 600 }}>
                  Customer Churn Risk Analysis
                </Typography>
                <Box display="flex" gap={2}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Risk Level</InputLabel>
                    <Select
                      value={churnFilter}
                      onChange={(e) => setChurnFilter(e.target.value)}
                      label="Risk Level"
                    >
                      <MenuItem value="all">All Risks</MenuItem>
                      {riskLevels.map(risk => (
                        <MenuItem key={risk} value={risk}>{risk}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Segment</InputLabel>
                    <Select
                      value={segmentFilter}
                      onChange={(e) => setSegmentFilter(e.target.value)}
                      label="Segment"
                    >
                      <MenuItem value="all">All Segments</MenuItem>
                      {segments.map(segment => (
                        <MenuItem key={segment} value={segment}>{segment}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              
              {/* Summary Statistics */}
              <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                {riskLevels.map(risk => {
                  const count = filteredCustomers.filter(c => c.churn_risk === risk).length;
                  const percentage = ((count / filteredCustomers.length) * 100).toFixed(1);
                  return (
                    <Chip
                      key={risk}
                      label={`${risk}: ${count} (${percentage}%)`}
                      color={
                        risk === 'High Risk' ? 'error' : 
                        risk === 'Medium Risk' ? 'warning' : 
                        risk === 'Low Risk' ? 'info' : 'success'
                      }
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  );
                })}
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Comprehensive customer churn analysis with {filteredCustomers.length} customers:
                <br />• <strong style={{color: '#d32f2f'}}>High Risk</strong> (90+ days inactive or no orders)
                <br />• <strong style={{color: '#f57c00'}}>Medium Risk</strong> (60-90 days inactive)
                <br />• <strong style={{color: '#1976d2'}}>Low Risk</strong> (30-60 days inactive)
                <br />• <strong style={{color: '#388e3c'}}>Very Low Risk</strong> (≤30 days inactive)
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Risk Level</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Segment</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Orders</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Lifetime Value</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Days Inactive</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Activity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedCustomers.map((customer) => (
                      <TableRow key={customer.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {customer.first_name} {customer.last_name}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={customer.churn_risk} 
                            color={
                              customer.churn_risk === 'High Risk' ? 'error' : 
                              customer.churn_risk === 'Medium Risk' ? 'warning' : 
                              customer.churn_risk === 'Low Risk' ? 'info' : 'success'
                            }
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={customer.customer_segment} 
                            color={
                              customer.customer_segment === 'VIP' ? 'error' : 
                              customer.customer_segment === 'Premium' ? 'warning' : 
                              customer.customer_segment === 'Regular' ? 'info' : 'default'
                            }
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {customer.total_orders}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          ৳{customer.lifetime_value?.toLocaleString() || '0'}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {customer.days_since_last_order} days
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={customer.activity_status} 
                            color={
                              customer.activity_status === 'Very Active' ? 'success' : 
                              customer.activity_status === 'Active' ? 'info' : 
                              customer.activity_status === 'Inactive' ? 'warning' : 'error'
                            }
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Pagination */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                <Typography variant="body2" color="text.secondary">
                  Showing {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filteredCustomers.length)} of {filteredCustomers.length} customers
                </Typography>
                <Box display="flex" gap={1}>
                  <Button
                    size="small"
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    size="small"
                    disabled={(page + 1) * rowsPerPage >= filteredCustomers.length}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
              
              {filteredCustomers.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body2" color="success.main">
                    ✅ No customers match the selected filters!
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Activity Analysis */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ 
            backgroundColor: '#ffffff', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
            border: '1px solid #e0e0e0',
            borderRadius: 3
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" color="#40513B" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Customer Activity Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Customer engagement levels based on recent order activity:
                <br />• <strong style={{color: '#388e3c'}}>Very Active</strong> (≤7 days) - Recently engaged
                <br />• <strong style={{color: '#1976d2'}}>Active</strong> (8-30 days) - Moderately engaged
                <br />• <strong style={{color: '#f57c00'}}>Inactive</strong> (31-90 days) - Needs re-engagement
                <br />• <strong style={{color: '#d32f2f'}}>Very Inactive</strong> (&gt;90 days) - High churn risk
                <br />• <strong style={{color: '#757575'}}>No Orders</strong> - Never purchased
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Activity Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Orders</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Lifetime Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(data.customer_activity || []).slice(0, 10).map((customer) => (
                      <TableRow key={customer.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {customer.first_name} {customer.last_name}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={customer.activity_status} 
                            color={
                              customer.activity_status === 'Very Active' ? 'success' :
                              customer.activity_status === 'Active' ? 'primary' :
                              customer.activity_status === 'Inactive' ? 'warning' :
                              customer.activity_status === 'Very Inactive' ? 'error' : 'default'
                            }
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{customer.total_orders}</TableCell>
                        <TableCell sx={{ fontWeight: 500, color: '#40513B' }}>
                          ৳{customer.lifetime_value?.toLocaleString() || '0'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Distribution */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            backgroundColor: '#ffffff', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
            border: '1px solid #e0e0e0',
            borderRadius: 3
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" color="#40513B" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Customer Activity Distribution
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Distribution of customers across different activity levels and their average value.
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.activity_distribution || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="activity_status" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Number of Customers', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                  />
                  <RechartsTooltip 
                    formatter={(value, name) => [value, 'Customers']}
                    labelFormatter={(label) => `Activity: ${label}`}
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

        {/* Demand Forecast & Inventory Management */}
        <Grid item xs={12}>
          <Card sx={{ 
            backgroundColor: '#ffffff', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
            border: '1px solid #e0e0e0',
            borderRadius: 3
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" color="#40513B" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Demand Forecast & Inventory Management
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Product demand analysis and inventory optimization recommendations:
                <br />• <strong style={{color: '#d32f2f'}}>Out of Stock</strong> - No inventory available (urgent reorder needed)
                <br />• <strong style={{color: '#f57c00'}}>Understocked</strong> - Stock below demand (need to reorder)
                <br />• <strong style={{color: '#388e3c'}}>Well Stocked</strong> - Optimal inventory levels
                <br />• <strong style={{color: '#ff9800'}}>Overstocked</strong> - Stock much higher than demand (reduce orders)
                <br />• <strong>Inventory Turnover</strong> - How many times inventory sells per year (higher = better)
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Product Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Current Stock</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Demand (30 days)</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Inventory Turnover</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Days in Stock</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Stock Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(data.demand_forecast || []).map((product) => (
                      <TableRow key={product.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                        <TableCell sx={{ fontWeight: 500 }}>{product.name}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{product.stock}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {product.demand_last_30_days} orders
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            ({product.total_quantity_demanded} units)
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          <Chip 
                            label={`${product.inventory_turnover?.toFixed(1) || 0}x/year`}
                            color={
                              product.inventory_turnover > 12 ? 'success' :
                              product.inventory_turnover > 6 ? 'warning' : 'error'
                            }
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {product.days_in_stock?.toFixed(0) || 0} days
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={product.stock_status} 
                            color={
                              product.stock_status === 'Out of Stock' ? 'error' :
                              product.stock_status === 'Understocked' ? 'error' : 
                              product.stock_status === 'Overstocked' ? 'warning' : 'success'
                            }
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
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

// Real-time Analytics Tab
const RealTimeAnalytics = ({ data }) => {
  if (!data) {
    return <Alert severity="info">Real-time analytics data not available</Alert>;
  }

  return (
    <Grid container spacing={4}>
      {/* Recent Orders */}
      <Grid item xs={12} md={6}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="h6" color="#40513B" gutterBottom>
              Recent Orders (Last 24 Hours)
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {(data.recent_orders || []).map((order) => (
                <Box key={order.id} sx={{ mb: 2, p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    Order #{order.id} - {order.first_name} {order.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ৳{order.total_price?.toFixed(2)} • {order.status} • {order.city}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* System Health */}
      <Grid item xs={12} md={6}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="h6" color="#40513B" gutterBottom>
              System Health (Last 24 Hours)
            </Typography>
            <List>
              {(data.system_health || []).map((metric, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#40513B' }}>
                      {metric.metric === 'orders' ? <ShoppingCart /> :
                       metric.metric === 'customers' ? <People /> : <AttachMoney />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${metric.metric.charAt(0).toUpperCase() + metric.metric.slice(1)}: ${metric.count}`}
                    secondary={metric.period}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Low Stock Alerts */}
      <Grid item xs={12}>
        <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="h6" color="#40513B" gutterBottom>
              Low Stock Alerts
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Current Stock</TableCell>
                    <TableCell>Views</TableCell>
                    <TableCell>Purchase Count</TableCell>
                    <TableCell>Stock Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data.low_stock_alerts || []).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>{product.views}</TableCell>
                      <TableCell>{product.purchase_count}</TableCell>
                      <TableCell>
                        <Chip 
                          label={product.stock_status} 
                          color={
                            product.stock_status === 'Out of Stock' ? 'error' :
                            product.stock_status === 'Critical' ? 'warning' : 'info'
                          }
                          size="small"
                        />
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
  );
};

export default AdvancedAnalyticsDashboard; 