import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  AppBar,
  Toolbar,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';

const AdminCouponsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [statsDialog, setStatsDialog] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponStats, setCouponStats] = useState(null);

  const [formData, setFormData] = useState(() => {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    
    return {
      code: '',
      discount_type: 'percentage',
      value: '10',
      usage_limit: '100',
      valid_from: today.toISOString().split('T')[0],
      valid_until: nextMonth.toISOString().split('T')[0],
      is_active: true
    };
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchCoupons();
  }, [user, navigate]);

  const fetchCoupons = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/coupons/');
      if (!response.ok) throw new Error('Failed to fetch coupons');
      const data = await response.json();
      setCoupons(data.coupons || []);
    } catch (err) {
      setError('Failed to load coupons: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.code.trim()) {
      setError('Coupon code is required');
      return;
    }
    
    if (!formData.value || formData.value <= 0) {
      setError('Value must be greater than 0');
      return;
    }
    
    if (!formData.usage_limit || formData.usage_limit <= 0) {
      setError('Usage limit must be greater than 0');
      return;
    }
    
    if (!formData.valid_from || !formData.valid_until) {
      setError('Valid from and valid until dates are required');
      return;
    }
    
    if (new Date(formData.valid_until) <= new Date(formData.valid_from)) {
      setError('Valid until must be after valid from');
      return;
    }
    
    try {
      // Convert date strings to ISO format and validate data
      const submitData = {
        code: formData.code.trim().toUpperCase(),
        discount_type: formData.discount_type,
        value: parseFloat(formData.value),
        usage_limit: parseInt(formData.usage_limit),
        valid_from: formData.valid_from + 'T00:00:00',
        valid_until: formData.valid_until + 'T23:59:59',
        is_active: Boolean(formData.is_active)
      };

      const url = editingCoupon 
        ? `http://localhost:8000/api/v1/coupons/${editingCoupon.id}`
        : 'http://localhost:8000/api/v1/coupons/';
      
      const method = editingCoupon ? 'PUT' : 'POST';
      
      console.log('Submitting coupon data:', submitData);
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.detail || 'Failed to save coupon');
      }
      
      setOpenDialog(false);
      setEditingCoupon(null);
      resetForm();
      fetchCoupons();
    } catch (err) {
      setError('Failed to save coupon: ' + err.message);
    }
  };

  const handleDelete = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/v1/coupons/${couponId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete coupon');
      
      fetchCoupons();
    } catch (err) {
      setError('Failed to delete coupon: ' + err.message);
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      value: coupon.value.toString(),
      usage_limit: coupon.usage_limit.toString(),
      valid_from: coupon.valid_from.split('T')[0],
      valid_until: coupon.valid_until.split('T')[0],
      is_active: coupon.is_active !== false
    });
    setOpenDialog(true);
  };

  const handleViewStats = async (coupon) => {
    setSelectedCoupon(coupon);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/coupons/${coupon.id}/usage-stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setCouponStats(data.data);
      setStatsDialog(true);
    } catch (err) {
      setError('Failed to fetch coupon stats: ' + err.message);
    }
  };

  const resetForm = () => {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    
    setFormData({
      code: '',
      discount_type: 'percentage',
      value: '10',
      usage_limit: '100',
      valid_from: today.toISOString().split('T')[0],
      valid_until: nextMonth.toISOString().split('T')[0],
      is_active: true
    });
  };

  const getStatusColor = (coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);
    
    if (now < validFrom) return 'info';
    if (now > validUntil || coupon.used >= coupon.usage_limit) return 'error';
    return 'success';
  };

  const getStatusText = (coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);
    
    if (now < validFrom) return 'Upcoming';
    if (now > validUntil) return 'Expired';
    if (coupon.used >= coupon.usage_limit) return 'Used Up';
    return 'Active';
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
              Coupon Management
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/admin')}
              sx={{ color: '#fff' }}
            >
              Dashboard
            </Button>
            <Typography variant="body2" color="#fff">
              {user?.name || user?.username || 'Admin'}
            </Typography>
            <IconButton color="inherit" onClick={() => { logout(); navigate('/login'); }}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3, background: 'rgba(255, 255, 255, 0.95)' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" fontWeight="bold" color="#40513B">
              Coupon Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingCoupon(null);
                resetForm();
                setOpenDialog(true);
              }}
              sx={{
                backgroundColor: '#40513B',
                '&:hover': { backgroundColor: '#2d3a2a' }
              }}
            >
              Add Coupon
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress sx={{ color: '#40513B' }} />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Value</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Usage</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Valid Period</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" fontFamily="monospace">
                          {coupon.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={coupon.discount_type === 'percentage' ? 'Percentage' : 'Fixed'}
                          color={coupon.discount_type === 'percentage' ? 'primary' : 'secondary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {coupon.discount_type === 'percentage' ? `${coupon.value}%` : `৳${coupon.value}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {coupon.used}/{coupon.usage_limit}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(coupon)}
                          color={getStatusColor(coupon)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontSize="0.8rem">
                          {new Date(coupon.valid_from).toLocaleDateString()} - {new Date(coupon.valid_until).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="View Stats">
                            <IconButton
                              size="small"
                              onClick={() => handleViewStats(coupon)}
                              sx={{ color: '#40513B' }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(coupon)}
                              sx={{ color: '#40513B' }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(coupon.id)}
                              sx={{ color: '#dc3545' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      {/* Add/Edit Coupon Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Coupon Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                fullWidth
                inputProps={{ maxLength: 50 }}
              />
              
              <FormControl fullWidth>
                <InputLabel>Discount Type</InputLabel>
                <Select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                  label="Discount Type"
                >
                  <MenuItem value="percentage">Percentage</MenuItem>
                  <MenuItem value="fixed">Fixed Amount</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label={formData.discount_type === 'percentage' ? 'Percentage (%)' : 'Fixed Amount (৳)'}
                type="number"
                value={formData.value}
                onChange={(e) => {
                  const val = e.target.value;
                  if (formData.discount_type === 'percentage') {
                    // Limit percentage to 0-100
                    const numVal = Math.min(100, Math.max(0, parseFloat(val) || 0));
                    setFormData({ ...formData, value: numVal.toString() });
                  } else {
                    // Allow any positive number for fixed amount
                    const numVal = Math.max(0, parseFloat(val) || 0);
                    setFormData({ ...formData, value: numVal.toString() });
                  }
                }}
                required
                fullWidth
                inputProps={{ 
                  min: 0,
                  max: formData.discount_type === 'percentage' ? 100 : undefined,
                  step: formData.discount_type === 'percentage' ? 1 : 0.01
                }}
              />
              
              <TextField
                label="Usage Limit"
                type="number"
                value={formData.usage_limit}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value) || 1);
                  setFormData({ ...formData, usage_limit: val.toString() });
                }}
                required
                fullWidth
                inputProps={{ min: 1 }}
              />
              
              <TextField
                label="Valid From"
                type="date"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                label="Valid Until"
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    color="primary"
                  />
                }
                label="Active"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ backgroundColor: '#40513B' }}>
              {editingCoupon ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={statsDialog} onClose={() => setStatsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Coupon Statistics - {selectedCoupon?.code}
        </DialogTitle>
        <DialogContent>
          {couponStats && (
            <Box>
              <Typography variant="h6" mb={2}>Usage Statistics</Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography>Total Usage: {couponStats.total_usage || 0}</Typography>
                <Typography>Remaining Usage: {couponStats.remaining_usage || 0}</Typography>
                <Typography>Usage Rate: {couponStats.usage_rate || 0}%</Typography>
                <Typography>Total Discount Given: ৳{couponStats.total_discount || 0}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCouponsPage; 