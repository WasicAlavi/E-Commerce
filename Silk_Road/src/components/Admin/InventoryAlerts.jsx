import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Collapse,
  Button
} from '@mui/material';
import {
  Warning,
  Inventory,
  ExpandMore,
  ExpandLess,
  Visibility
} from '@mui/icons-material';
import analyticsService from '../../services/analyticsService';

const InventoryAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInventoryAlerts();
  }, []);

  const fetchInventoryAlerts = async () => {
    try {
      setLoading(true);
      const response = await analyticsService.getInventoryAnalytics();
      if (response.data?.low_stock_products) {
        setAlerts(response.data.low_stock_products);
      }
    } catch (err) {
      console.error('Error fetching inventory alerts:', err);
      setError('Failed to load inventory alerts');
    } finally {
      setLoading(false);
    }
  };

  const getAlertSeverity = (status) => {
    switch (status) {
      case 'Out of Stock':
        return 'error';
      case 'Critical':
        return 'warning';
      case 'Low':
        return 'info';
      default:
        return 'success';
    }
  };

  const getAlertIcon = (status) => {
    switch (status) {
      case 'Out of Stock':
        return <Warning sx={{ color: '#dc3545' }} />;
      case 'Critical':
        return <Warning sx={{ color: '#ffc107' }} />;
      case 'Low':
        return <Inventory sx={{ color: '#17a2b8' }} />;
      default:
        return <Inventory sx={{ color: '#28a745' }} />;
    }
  };

  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" color="#40513B" gutterBottom>
            Inventory Alerts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Loading inventory data...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const criticalAlerts = alerts.filter(alert => alert.stock_status === 'Out of Stock' || alert.stock_status === 'Critical');
  const lowStockAlerts = alerts.filter(alert => alert.stock_status === 'Low');

  return (
    <Card sx={{ mb: 3, border: '1px solid #dee2e6' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Warning sx={{ color: '#ffc107' }} />
            <Typography variant="h6" color="#40513B" fontWeight="bold">
              Inventory Alerts
            </Typography>
            {alerts.length > 0 && (
              <Chip 
                label={alerts.length} 
                size="small" 
                color="warning"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          <Box display="flex" gap={1}>
            <IconButton 
              size="small" 
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>

        {alerts.length === 0 ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            All products have sufficient stock levels.
          </Alert>
        ) : (
          <>
            {criticalAlerts.length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  {criticalAlerts.length} critical stock alert{criticalAlerts.length > 1 ? 's' : ''}
                </Typography>
                <Typography variant="body2">
                  Immediate attention required for out of stock and critical items.
                </Typography>
              </Alert>
            )}

            {lowStockAlerts.length > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  {lowStockAlerts.length} low stock alert{lowStockAlerts.length > 1 ? 's' : ''}
                </Typography>
                <Typography variant="body2">
                  Consider restocking these items soon.
                </Typography>
              </Alert>
            )}

            <Collapse in={expanded}>
              <List dense>
                {alerts.map((alert, index) => (
                  <ListItem 
                    key={alert.id || index}
                    sx={{ 
                      border: '1px solid #dee2e6', 
                      borderRadius: 1, 
                      mb: 1,
                      backgroundColor: getAlertSeverity(alert.stock_status) === 'error' ? '#ffebee' : 
                                     getAlertSeverity(alert.stock_status) === 'warning' ? '#fff3e0' : '#e3f2fd'
                    }}
                  >
                    <ListItemIcon>
                      {getAlertIcon(alert.stock_status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" fontWeight="bold">
                            {alert.name}
                          </Typography>
                          <Chip 
                            label={alert.stock_status} 
                            size="small" 
                            color={getAlertSeverity(alert.stock_status)}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          Stock: {alert.stock} units • Price: ৳{alert.price}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>

            {alerts.length > 0 && (
              <Box display="flex" justifyContent="center" mt={2}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={expanded ? <ExpandLess /> : <Visibility />}
                  onClick={() => setExpanded(!expanded)}
                  sx={{ 
                    borderColor: '#40513B',
                    color: '#40513B',
                    '&:hover': { 
                      borderColor: '#2d3a2a',
                      backgroundColor: '#40513B10'
                    }
                  }}
                >
                  {expanded ? 'Show Less' : `View All Alerts (${alerts.length})`}
                </Button>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryAlerts; 