import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Tooltip,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LocalShipping as LocalShippingIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Update as UpdateIcon,
  DirectionsCar as DirectionsCarIcon,
  LocationOn as LocationOnIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import authService from '../../services/authService';
import riderService from '../../services/riderService';

const RiderDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [riderProfile, setRiderProfile] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveriesLoading, setDeliveriesLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingProfile, setEditingProfile] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    delivery_notes: ''
  });
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [deliveryToReject, setDeliveryToReject] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedDeliveryDetails, setSelectedDeliveryDetails] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchRiderData();
  }, [user, navigate]);

  const fetchRiderData = async () => {
    setLoading(true);
    setError('');
    try {
      // Try to get rider profile first
      const profileData = await riderService.getRiderProfile();
      setRiderProfile(profileData.data);
      
      // Then try to get deliveries
      try {
        const deliveriesData = await riderService.getRiderDeliveries();
        setDeliveries(deliveriesData.assignments || []);
      } catch (deliveryErr) {
        console.error('Error fetching deliveries:', deliveryErr);
        setDeliveries([]);
        // Don't show error for deliveries, just set empty array
      }
    } catch (err) {
      console.error('Error fetching rider data:', err);
      if (err.message.includes('404') || err.message.includes('Not Found')) {
        setError('Rider profile not found. Please register as a rider first.');
        setRiderProfile(null);
        setDeliveries([]);
      } else {
        setError('Failed to fetch rider data: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveries = async () => {
    setDeliveriesLoading(true);
    try {
      const data = await riderService.getRiderDeliveries();
      setDeliveries(data.assignments || []);
    } catch (err) {
      console.error('Error fetching deliveries:', err);
      if (err.message.includes('404') || err.message.includes('Not Found')) {
        setDeliveries([]);
      } else if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        setError('Authentication failed. Please log in again.');
        navigate('/login');
      } else {
        setError('Failed to fetch deliveries: ' + err.message);
      }
    } finally {
      setDeliveriesLoading(false);
    }
  };

  const handleUpdateProfile = async (updateData) => {
    try {
      await riderService.updateRiderProfile(updateData);
      setSuccess('Profile updated successfully');
      setEditDialogOpen(false);
      setEditingProfile(null);
      fetchRiderData();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile: ' + err.message);
    }
  };

  const handleAcceptDelivery = async (delivery) => {
    try {
      await riderService.acceptDelivery(delivery.id);
      setSuccess('Delivery accepted successfully');
      fetchDeliveries();
    } catch (err) {
      console.error('Error accepting delivery:', err);
      setError('Failed to accept delivery: ' + err.message);
    }
  };

  const handleRejectDelivery = async (delivery, reason) => {
    try {
      await riderService.rejectDelivery(delivery.id, reason);
      setSuccess('Delivery rejected successfully');
      setRejectionDialogOpen(false);
      setRejectionReason('');
      setDeliveryToReject(null);
      fetchDeliveries();
    } catch (err) {
      console.error('Error rejecting delivery:', err);
      setError('Failed to reject delivery: ' + err.message);
    }
  };

  const handleRejectClick = (delivery) => {
    setDeliveryToReject(delivery);
    setRejectionDialogOpen(true);
  };

  const handleUpdateDeliveryStatus = async () => {
    if (!selectedDelivery || !statusUpdate.status) return;
    
    try {
      await riderService.updateDeliveryStatus(
        selectedDelivery.id, 
        statusUpdate.status, 
        statusUpdate.delivery_notes
      );
      setSuccess('Delivery status updated successfully');
      setStatusDialogOpen(false);
      setSelectedDelivery(null);
      setStatusUpdate({ status: '', delivery_notes: '' });
      fetchDeliveries();
    } catch (err) {
      console.error('Error updating delivery status:', err);
      setError('Failed to update delivery status: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'delivered':
      case 'accepted':
        return 'success';
      case 'inactive':
      case 'cancelled':
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      case 'picked_up':
      case 'in_transit':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEditProfile = () => {
    setEditingProfile(riderProfile);
    setEditDialogOpen(true);
  };

  const handleUpdateStatus = (delivery) => {
    setSelectedDelivery(delivery);
    setStatusUpdate({ status: delivery.status, delivery_notes: delivery.delivery_notes || '' });
    setStatusDialogOpen(true);
  };

  const handleViewDetails = (delivery) => {
    setSelectedDeliveryDetails(delivery);
    setDetailsDialogOpen(true);
  };

  if (!user) return null;

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #9DC08B 0%, #40513B 100%)', p: 0 }}>
      {/* Rider Header */}
      <AppBar position="static" sx={{ background: '#40513B', boxShadow: 2 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <img src="/logo4.png" alt="Logo" style={{ height: 40, borderRadius: 8 }} />
            <Typography variant="h6" fontWeight="bold" color="#fff">
              Rider Dashboard
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="#fff">
              {user?.name || user?.username || 'Rider'}
            </Typography>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate('/')}
              sx={{ borderColor: '#fff', color: '#fff' }}
            >
              Back to Home
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box display="flex" alignItems="center" gap={2}>
              <LocalShippingIcon sx={{ fontSize: 40, color: '#40513B' }} />
              <Typography variant="h4" fontWeight="bold" color="#40513B">
                Rider Dashboard
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchRiderData}
              disabled={loading}
              sx={{
                backgroundColor: '#40513B',
                '&:hover': { backgroundColor: '#2d3a2a' },
                borderRadius: 2,
                px: 3
              }}
            >
              Refresh
            </Button>
          </Box>

          {/* Alerts */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
              <CircularProgress size={60} sx={{ color: '#40513B' }} />
            </Box>
          ) : !riderProfile ? (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={300}>
              <LocalShippingIcon sx={{ fontSize: 80, color: '#40513B', mb: 3 }} />
              <Typography variant="h5" fontWeight="bold" color="#40513B" gutterBottom>
                Not Registered as Rider
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center" mb={4}>
                You need to register as a rider to access the dashboard.
                <br />
                Please complete your rider registration first.
              </Typography>
              <Box display="flex" gap={2}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/profile')}
                  sx={{
                    backgroundColor: '#40513B',
                    '&:hover': { backgroundColor: '#2d3a2a' },
                    borderRadius: 2,
                    px: 3
                  }}
                >
                  Go to Profile
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/')}
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
                  Back to Home
                </Button>
              </Box>
            </Box>
          ) : (
            <Grid container spacing={4}>
              {/* Rider Profile */}
              <Grid item xs={12} md={4}>
                <Card sx={{ mb: 4, border: '1px solid #dee2e6', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                      <Typography variant="h5" fontWeight="bold" color="#40513B">
                        My Profile
                      </Typography>
                      <IconButton onClick={handleEditProfile} sx={{ color: '#40513B' }}>
                        <EditIcon />
                      </IconButton>
                    </Box>
                    
                    {riderProfile && (
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <DirectionsCarIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Vehicle Type" 
                            secondary={riderProfile.vehicle_type || 'N/A'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <AssignmentIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Vehicle Number" 
                            secondary={riderProfile.vehicle_number || 'N/A'} 
                          />
                        </ListItem>

                        <ListItem>
                          <ListItemIcon>
                            <LocalShippingIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Total Deliveries" 
                            secondary={riderProfile.total_deliveries || 0} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <LocationOnIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Status" 
                            secondary={riderProfile.is_active ? 'Active' : 'Inactive'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleIcon color="primary" />
                          </ListItemIcon>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Status:
                            </Typography>
                            <Chip 
                              label={riderProfile.is_active ? 'Active' : 'Inactive'} 
                              color={getStatusColor(riderProfile.is_active ? 'active' : 'inactive')}
                              size="small"
                            />
                          </Box>
                        </ListItem>
                      </List>
                    )}

                    {riderProfile?.delivery_zones && riderProfile.delivery_zones.length > 0 && (
                      <Box mt={2}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          Delivery Zones
                        </Typography>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          {riderProfile.delivery_zones.map((zone, index) => (
                            <Chip 
                              key={index} 
                              label={zone} 
                              color="primary" 
                              variant="outlined"
                              size="small"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Deliveries */}
              <Grid item xs={12} md={8}>
                <Card sx={{ border: '1px solid #dee2e6', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold" color="#40513B" mb={3}>
                      My Deliveries ({deliveries.length})
                    </Typography>
                    
                    {deliveriesLoading ? (
                      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                        <CircularProgress sx={{ color: '#40513B' }} />
                      </Box>
                    ) : deliveries.length === 0 ? (
                      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight={100} gap={2}>
                        <Typography variant="body2" color="text.secondary">
                          No deliveries assigned yet.
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={fetchDeliveries}
                          disabled={deliveriesLoading}
                        >
                          Refresh
                        </Button>
                      </Box>
                                        ) : (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Order ID</strong></TableCell>
                              <TableCell><strong>Status</strong></TableCell>
                              <TableCell><strong>Assigned At</strong></TableCell>
                              <TableCell><strong>Estimated Delivery</strong></TableCell>
                              <TableCell><strong>Actions</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {deliveries.map((delivery) => (
                              <TableRow key={delivery.id}>
                                  <TableCell>
                                    <Typography variant="body2" fontWeight="bold">
                                      {delivery.order_details?.secure_order_id || `Order #${delivery.order_id}`}
                                    </Typography>
                                    {delivery.order_details?.transaction_id && (
                                      <Typography variant="caption" color="text.secondary">
                                        TXN: {delivery.order_details.transaction_id}
                                      </Typography>
                                    )}
                                    {!delivery.order_details && (
                                      <Typography variant="caption" color="warning.main">
                                        Order details loading...
                                      </Typography>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={delivery.status} 
                                      color={getStatusColor(delivery.status)}
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>{formatDate(delivery.assigned_at)}</TableCell>
                                  <TableCell>
                                    {delivery.estimated_delivery ? formatDate(delivery.estimated_delivery) : 'N/A'}
                                  </TableCell>
                                  <TableCell>
                                    <Box display="flex" gap={1}>
                                      {delivery.status === 'pending' && (
                                        <>
                                          <Tooltip title="Accept Delivery">
                                            <IconButton 
                                              size="small" 
                                              onClick={() => handleAcceptDelivery(delivery)}
                                              sx={{ color: '#4CAF50' }}
                                            >
                                              <CheckCircleIcon />
                                            </IconButton>
                                          </Tooltip>
                                          <Tooltip title="Reject Delivery">
                                            <IconButton 
                                              size="small" 
                                              onClick={() => handleRejectClick(delivery)}
                                              sx={{ color: '#f44336' }}
                                            >
                                              <CancelIcon />
                                            </IconButton>
                                          </Tooltip>
                                        </>
                                      )}
                                      
                                      {['accepted', 'picked_up', 'in_transit'].includes(delivery.status) && (
                                        <Tooltip title="Update Status">
                                          <IconButton 
                                            size="small" 
                                            onClick={() => handleUpdateStatus(delivery)}
                                            sx={{ color: '#9DC08B' }}
                                          >
                                            <UpdateIcon />
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                      
                                      <Tooltip title="View Details">
                                        <IconButton 
                                          size="small" 
                                          onClick={() => handleViewDetails(delivery)}
                                          sx={{ color: '#40513B' }}
                                        >
                                          <VisibilityIcon />
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
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Paper>
      </Box>

      {/* Edit Profile Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          {editingProfile && (
            <EditProfileForm 
              profile={editingProfile} 
              onUpdate={handleUpdateProfile}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog 
        open={statusDialogOpen} 
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Delivery Status</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusUpdate.status}
                onChange={(e) => setStatusUpdate(prev => ({ ...prev, status: e.target.value }))}
                label="Status"
              >
                <MenuItem value="picked_up">Picked Up</MenuItem>
                <MenuItem value="in_transit">In Transit</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Delivery Notes"
              value={statusUpdate.delivery_notes}
              onChange={(e) => setStatusUpdate(prev => ({ ...prev, delivery_notes: e.target.value }))}
              placeholder="Add any notes about the delivery..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdateDeliveryStatus}
            variant="contained"
            disabled={!statusUpdate.status}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Reason Dialog */}
      <Dialog 
        open={rejectionDialogOpen} 
        onClose={() => setRejectionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Delivery</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Rejection Reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejecting this delivery..."
              sx={{ mb: 3 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleRejectDelivery(deliveryToReject, rejectionReason)}
            variant="contained"
            color="error"
            disabled={!rejectionReason.trim()}
          >
            Reject Delivery
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delivery Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="div">
            Delivery Details - {selectedDeliveryDetails?.order_details?.secure_order_id || `Order #${selectedDeliveryDetails?.order_id}`}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedDeliveryDetails && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Order Information
                </Typography>
                {!selectedDeliveryDetails.order_details && (
                  <Typography variant="body2" color="warning.main" sx={{ mb: 2 }}>
                    ⚠️ Order details are not available. This might be due to a temporary issue.
                  </Typography>
                )}
                <Typography variant="body2">Order ID: {selectedDeliveryDetails.order_details?.secure_order_id || `Order #${selectedDeliveryDetails.order_id}`}</Typography>
                <Typography variant="body2">Total Price: ৳{selectedDeliveryDetails.order_details?.total_price?.toFixed(2) || '0.00'}</Typography>
                <Typography variant="body2">Order Status: {selectedDeliveryDetails.order_details?.status || 'N/A'}</Typography>
                {selectedDeliveryDetails.order_details?.transaction_id && (
                  <Typography variant="body2">Transaction ID: {selectedDeliveryDetails.order_details.transaction_id}</Typography>
                )}
                {!selectedDeliveryDetails.order_details?.transaction_id && (
                  <Typography variant="body2" color="text.secondary">Transaction ID: Not available</Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Delivery Information
                </Typography>
                <Typography variant="body2">Assignment ID: {selectedDeliveryDetails.secure_assignment_id}</Typography>
                <Typography variant="body2">Status: {selectedDeliveryDetails.status}</Typography>
                <Typography variant="body2">Assigned At: {formatDate(selectedDeliveryDetails.assigned_at)}</Typography>
                <Typography variant="body2">Estimated Delivery: {selectedDeliveryDetails.estimated_delivery ? formatDate(selectedDeliveryDetails.estimated_delivery) : 'N/A'}</Typography>
                {selectedDeliveryDetails.accepted_at && (
                  <Typography variant="body2">Accepted At: {formatDate(selectedDeliveryDetails.accepted_at)}</Typography>
                )}
                {selectedDeliveryDetails.rejected_at && (
                  <Typography variant="body2">Rejected At: {formatDate(selectedDeliveryDetails.rejected_at)}</Typography>
                )}
                {selectedDeliveryDetails.actual_delivery && (
                  <Typography variant="body2">Actual Delivery: {formatDate(selectedDeliveryDetails.actual_delivery)}</Typography>
                )}
              </Grid>
              {selectedDeliveryDetails.delivery_notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Delivery Notes
                  </Typography>
                  <Typography variant="body2">{selectedDeliveryDetails.delivery_notes}</Typography>
                </Grid>
              )}
              {selectedDeliveryDetails.rejection_reason && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Rejection Reason
                  </Typography>
                  <Typography variant="body2">{selectedDeliveryDetails.rejection_reason}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Edit Profile Form Component
const EditProfileForm = ({ profile, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    vehicle_type: profile.vehicle_type || '',
    vehicle_number: profile.vehicle_number || '',
    delivery_zones: profile.delivery_zones || []
  });
  const [newZone, setNewZone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleAddZone = () => {
    if (newZone.trim() && !formData.delivery_zones.includes(newZone.trim())) {
      setFormData(prev => ({
        ...prev,
        delivery_zones: [...prev.delivery_zones, newZone.trim()]
      }));
      setNewZone('');
    }
  };

  const handleRemoveZone = (zoneToRemove) => {
    setFormData(prev => ({
      ...prev,
      delivery_zones: prev.delivery_zones.filter(zone => zone !== zoneToRemove)
    }));
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Vehicle Type</InputLabel>
            <Select
              value={formData.vehicle_type}
              onChange={(e) => setFormData(prev => ({ ...prev, vehicle_type: e.target.value }))}
              label="Vehicle Type"
            >
              <MenuItem value="bike">Bike</MenuItem>
              <MenuItem value="car">Car</MenuItem>
              <MenuItem value="van">Van</MenuItem>
              <MenuItem value="truck">Truck</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Vehicle Number"
            value={formData.vehicle_number}
            onChange={(e) => setFormData(prev => ({ ...prev, vehicle_number: e.target.value }))}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Delivery Zones
          </Typography>
          <Box display="flex" gap={1} mb={2}>
            <TextField
              size="small"
              label="Add Zone"
              value={newZone}
              onChange={(e) => setNewZone(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddZone())}
            />
            <Button 
              variant="outlined" 
              onClick={handleAddZone}
              disabled={!newZone.trim()}
            >
              Add
            </Button>
          </Box>
          <Box display="flex" gap={1} flexWrap="wrap">
            {formData.delivery_zones.map((zone, index) => (
              <Chip
                key={index}
                label={zone}
                onDelete={() => handleRemoveZone(zone)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Grid>
      </Grid>

      <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="contained" color="primary">
          Update Profile
        </Button>
      </Box>
    </Box>
  );
};

export default RiderDashboard; 