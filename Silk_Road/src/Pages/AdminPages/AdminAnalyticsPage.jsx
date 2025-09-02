import React from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, Logout } from '@mui/icons-material';
import AnalyticsDashboard from '../../components/Admin/AnalyticsDashboard';
import { useAuth } from '../../AuthContext';

const AdminAnalyticsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #9DC08B 0%, #40513B 100%)' }}>
      {/* Admin Header */}
      <AppBar position="static" sx={{ background: '#40513B', boxShadow: 2 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton 
              color="inherit" 
              onClick={() => navigate('/admin')}
              sx={{ mr: 1 }}
            >
              <ArrowBack />
            </IconButton>
            <img src="/logo4.png" alt="Logo" style={{ height: 40, borderRadius: 8 }} />
            <Typography variant="h6" fontWeight="bold" color="#fff">
              Analytics Dashboard
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="#fff">
              {user?.name || user?.username || 'Admin'}
            </Typography>
            <IconButton color="inherit" onClick={handleLogout}>
              <Logout />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Analytics Content */}
      <Box sx={{ p: 0 }}>
        <AnalyticsDashboard />
      </Box>
    </Box>
  );
};

export default AdminAnalyticsPage; 