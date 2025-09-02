import React from 'react';
import { Card, CardContent, Typography, Grid, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StarIcon from '@mui/icons-material/Star';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning'; 

const StatCard = ({ title, value, icon, color, subtitle, onClick }) => (
  <Card 
    sx={{ 
      minWidth: 200, 
      background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
      border: `1px solid ${color}30`,
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: onClick ? 'pointer' : 'default',
      '&:hover': onClick ? {
        transform: 'translateY(-2px) scale(1.03)',
        boxShadow: `0 8px 25px ${color}20`,
        opacity: 0.95
      } : {},
    }}
    onClick={onClick}
    elevation={onClick ? 6 : 1}
  >
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box 
          sx={{ 
            p: 1, 
            borderRadius: 2, 
            backgroundColor: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>
        <Typography variant="h4" fontWeight="bold" color={color}>
          {value}
        </Typography>
      </Box>
      <Typography variant="h6" color="#40513B" fontWeight="bold" gutterBottom>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const StatsCards = ({ stats }) => {
  const navigate = useNavigate();
  if (!stats) return null;
  
  // Helper for navigation
  const handleNavigate = (section) => {
    switch (section) {
      case 'users':
        navigate('/admin/users');
        break;
      case 'products':
        navigate('/admin/products');
        break;
      case 'orders':
        navigate('/admin/orders');
        break;
      case 'reviews':
        navigate('/admin/reviews');
        break;
      case 'carts':
        navigate('/admin/carts');
        break;
      case 'coupons':
        navigate('/admin/coupons');
        break;
      case 'analytics':
        navigate('/admin/analytics');
        break;
      case 'revenue':
        navigate('/admin/orders'); // Revenue is part of orders
        break;
      default:
        break;
    }
  };

  return (
    <Grid container spacing={3} mb={3}>
      {/* Main Stats - clickable */}
      <Grid xs={12} sm={6} md={3}>
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers || 0}
          icon={<PeopleIcon sx={{ color: '#40513B', fontSize: 24 }} />}
          color="#40513B"
          subtitle="Registered users"
          onClick={() => handleNavigate('users')}
        />
      </Grid>
      <Grid xs={12} sm={6} md={3}>
        <StatCard 
          title="Total Products" 
          value={stats.totalProducts || 0}
          icon={<InventoryIcon sx={{ color: '#9DC08B', fontSize: 24 }} />}
          color="#9DC08B"
          subtitle="Available products"
          onClick={() => handleNavigate('products')}
        />
      </Grid>
      <Grid xs={12} sm={6} md={3}>
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders || 0}
          icon={<ShoppingCartIcon sx={{ color: '#28a745', fontSize: 24 }} />}
          color="#28a745"
          subtitle="All time orders"
          onClick={() => handleNavigate('orders')}
        />
      </Grid>
      <Grid xs={12} sm={6} md={3}>
        <StatCard 
          title="Total Revenue" 
          value={`${(stats.lastMonthRevenue || 0).toFixed(2)}`}
          icon={<span style={{fontSize: 24, color: '#17a2b8'}}>&#2547;</span>} // Unicode Taka symbol
          color="#17a745"
          subtitle="Last month sales"
        />
      </Grid>

      {/* Secondary Stats - clickable where appropriate */}
      <Grid xs={12} sm={6} md={3}>
        <StatCard 
          title="Total Reviews" 
          value={stats.totalReviews || 0}
          icon={<StarIcon sx={{ color: '#ffc107', fontSize: 24 }} />}
          color="#ffc107"
          subtitle={`Avg: ${(stats.averageRating || 0).toFixed(1)}/5`}
          onClick={() => handleNavigate('reviews')}
        />
      </Grid>
      <Grid xs={12} sm={6} md={3}>
        <StatCard 
          title="Active Carts" 
          value={stats.totalCarts || 0}
          icon={<ShoppingBasketIcon sx={{ color: '#6f42c1', fontSize: 24 }} />}
          color="#6f42c1"
          subtitle="Shopping carts"
          onClick={() => handleNavigate('carts')}
        />
      </Grid>
      <Grid xs={12} sm={6} md={3}>
        <StatCard 
          title="Coupons" 
          value={stats.totalCoupons || ''}
          icon={<AttachMoneyIcon sx={{ color: '#ffc107', fontSize: 24 }} />}
          color="#ffc107"
          subtitle="Manage coupons"
          onClick={() => handleNavigate('coupons')}
        />
      </Grid>
      <Grid xs={12} sm={6} md={3}>
        <StatCard 
          title="Recent Orders" 
          value={stats.recentOrders || 0}
          icon={<LocalShippingIcon sx={{ color: '#fd7e14', fontSize: 24 }} />}
          color="#fd7e14"
          subtitle="Last 7 days"
        />
      </Grid>
      

      {/* Order Status Breakdown */}
      {stats.statusBreakdown && Object.entries(stats.statusBreakdown).map(([status, count]) => {
        let icon, color;
        switch (status.toLowerCase()) {
          case 'pending':
            icon = <PendingIcon sx={{ color: '#6c757d', fontSize: 20 }} />;
            color = '#6c757d'; // grey for pending
            break;
          case 'processing':
            icon = <LocalShippingIcon sx={{ color: '#17a2b8', fontSize: 20 }} />;
            color = '#17a2b8';
            break;
          case 'approved':
            icon = <LocalShippingIcon sx={{ color: '#ffc107', fontSize: 20 }} />;
            color = '#ffc107'; // yellow for approved
            break;
          case 'shipped':
            icon = <LocalShippingIcon sx={{ color: '#28a745', fontSize: 20 }} />;
            color = '#28a745';
            break;
          case 'delivered':
            icon = <CheckCircleIcon sx={{ color: '#28a745', fontSize: 20 }} />;
            color = '#28a745';
            break;
          case 'cancelled':
            icon = <CancelIcon sx={{ color: '#dc3545', fontSize: 20 }} />;
            color = '#dc3545';
            break;
          default:
            icon = <PendingIcon sx={{ color: '#6c757d', fontSize: 20 }} />;
            color = '#6c757d';
        }
        const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1);
        return (
          <Grid xs={12} sm={6} md={3} key={status}>
            <StatCard 
              title={`${capitalizedStatus} Orders`}
              value={count}
              icon={icon}
              color={color}
              subtitle={`${capitalizedStatus} status`}
            />
          </Grid>
        );
      })}
    </Grid>
  );
};

export default StatsCards; 