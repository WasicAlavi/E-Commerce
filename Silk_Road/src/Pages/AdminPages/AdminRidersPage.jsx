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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Tooltip,
  AppBar,
  Toolbar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LocalShipping as LocalShippingIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import authService from '../../services/authService';
import riderService from '../../services/riderService';

const AdminRidersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [riders, setRiders] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [riderDialogOpen, setRiderDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRider, setEditingRider] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchRiders();
  }, [user, navigate]);

  const fetchRiders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await riderService.getAllRiders();
      setRiders(data.riders || []);
    } catch (err) {
      console.error('Error fetching riders:', err);
      setError('Failed to fetch riders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async (riderId = null) => {
    setAssignmentsLoading(true);
    try {
      const data = riderId 
        ? await riderService.getRiderDeliveriesById(riderId)
        : await riderService.getAllAssignments();
      
      setAssignments(data.assignments || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to fetch assignments: ' + err.message);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const handleActivateRider = async (riderId) => {
    try {
      await riderService.activateRider(riderId);
      setSuccess('Rider activated successfully');
      fetchRiders();
    } catch (err) {
      console.error('Error activating rider:', err);
      setError('Failed to activate rider: ' + err.message);
    }
  };

  const handleDeactivateRider = async (riderId) => {
    try {
      await riderService.deactivateRider(riderId);
      setSuccess('Rider deactivated successfully');
      fetchRiders();
    } catch (err) {
      console.error('Error deactivating rider:', err);
      setError('Failed to deactivate rider: ' + err.message);
    }
  };

  const handleUpdateRider = async (riderId, updateData) => {
    try {
      await riderService.updateRider(riderId, updateData);
      setSuccess('Rider updated successfully');
      setEditDialogOpen(false);
      setEditingRider(null);
      fetchRiders();
    } catch (err) {
      console.error('Error updating rider:', err);
      setError('Failed to update rider: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'delivered':
        return 'success';
      case 'inactive':
      case 'cancelled':
        return 'error';
      case 'pending':
        return 'warning';
      case 'processing':
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

  const handleViewRider = (rider) => {
    setSelectedRider(rider);
    setRiderDialogOpen(true);
  };

  const handleViewAssignments = (rider) => {
    setSelectedRider(rider);
    fetchAssignments(rider.id);
    setAssignmentDialogOpen(true);
  };

  const handleEditRider = (rider) => {
    setEditingRider(rider);
    setEditDialogOpen(true);
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
              Rider Management
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate('/admin')}
              sx={{ borderColor: '#fff', color: '#fff' }}
            >
              Back to Dashboard
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
                Rider Management
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchRiders}
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

          {/* Riders Table */}
          <Card sx={{ mb: 4, border: '1px solid #dee2e6', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" color="#40513B" mb={3}>
                All Riders ({riders.length})
              </Typography>
              
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                  <CircularProgress sx={{ color: '#40513B' }} />
                </Box>
              ) : riders.length === 0 ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
                  <Typography variant="body2" color="text.secondary">
                    No riders found.
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>ID</strong></TableCell>
                        <TableCell><strong>Name</strong></TableCell>
                        <TableCell><strong>Email</strong></TableCell>
                        <TableCell><strong>Vehicle</strong></TableCell>
                        <TableCell><strong>Zones</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>

                        <TableCell><strong>Deliveries</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {riders.map((rider) => (
                        <TableRow key={rider.id}>
                          <TableCell>{rider.id}</TableCell>
                          <TableCell>{rider.user_name || 'N/A'}</TableCell>
                          <TableCell>{rider.user_email || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={rider.vehicle_type} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={0.5} flexWrap="wrap">
                              {rider.delivery_zones?.map((zone, index) => (
                                <Chip 
                                  key={index} 
                                  label={zone} 
                                  size="small" 
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={rider.is_active ? 'Active' : 'Inactive'} 
                              color={getStatusColor(rider.is_active ? 'active' : 'inactive')}
                              size="small"
                            />
                          </TableCell>

                          <TableCell>{rider.total_deliveries || 0}</TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <Tooltip title="View Details">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleViewRider(rider)}
                                  sx={{ color: '#40513B' }}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="View Deliveries">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleViewAssignments(rider)}
                                  sx={{ color: '#9DC08B' }}
                                >
                                  <LocalShippingIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Rider">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleEditRider(rider)}
                                  sx={{ color: '#40513B' }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              {rider.is_active ? (
                                <Tooltip title="Deactivate">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleDeactivateRider(rider.id)}
                                    sx={{ color: 'error.main' }}
                                  >
                                    <CancelIcon />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title="Activate">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleActivateRider(rider.id)}
                                    sx={{ color: 'success.main' }}
                                  >
                                    <CheckCircleIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
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
        </Paper>
      </Box>

      {/* Rider Details Dialog */}
      <Dialog 
        open={riderDialogOpen} 
        onClose={() => setRiderDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <PersonIcon color="primary" />
            <Typography variant="h6">Rider Details</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedRider && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Personal Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Name" 
                      secondary={selectedRider.user_name || 'N/A'} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Email" 
                      secondary={selectedRider.user_email || 'N/A'} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Phone" 
                      secondary={selectedRider.user_phone || 'N/A'} 
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Vehicle Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Vehicle Type" 
                      secondary={selectedRider.vehicle_type || 'N/A'} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Vehicle Number" 
                      secondary={selectedRider.vehicle_number || 'N/A'} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Status" 
                      secondary={selectedRider.is_active ? 'Active' : 'Inactive'} 
                    />
                    <Box sx={{ ml: 2 }}>
                      <Chip 
                        label={selectedRider.is_active ? 'Active' : 'Inactive'} 
                        color={getStatusColor(selectedRider.is_active ? 'active' : 'inactive')}
                        size="small"
                      />
                    </Box>
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Delivery Zones
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {selectedRider.delivery_zones?.map((zone, index) => (
                    <Chip 
                      key={index} 
                      label={zone} 
                      color="primary" 
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Performance
                </Typography>
                <Grid container spacing={2}>

                  <Grid item xs={6} md={3}>
                    <Box textAlign="center" p={2} bgcolor="#f5f5f5" borderRadius={1}>
                      <Typography variant="h6" color="primary">
                        {selectedRider.total_deliveries || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Deliveries
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box textAlign="center" p={2} bgcolor="#f5f5f5" borderRadius={1}>
                      <Typography variant="h6" color="primary">
                        {formatDate(selectedRider.created_at)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Joined
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box textAlign="center" p={2} bgcolor="#f5f5f5" borderRadius={1}>
                      <Typography variant="h6" color="primary">
                        {formatDate(selectedRider.updated_at)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Last Updated
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRiderDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delivery Assignments Dialog */}
      <Dialog 
        open={assignmentDialogOpen} 
        onClose={() => setAssignmentDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <LocalShippingIcon color="primary" />
            <Typography variant="h6">
              Delivery Assignments - {selectedRider?.user_name}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {assignmentsLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress sx={{ color: '#40513B' }} />
            </Box>
          ) : assignments.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
              <Typography variant="body2" color="text.secondary">
                No delivery assignments found for this rider.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Assignment ID</strong></TableCell>
                    <TableCell><strong>Order ID</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Assigned At</strong></TableCell>
                    <TableCell><strong>Estimated Delivery</strong></TableCell>
                    <TableCell><strong>Actual Delivery</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>{assignment.id}</TableCell>
                      <TableCell>{assignment.order_id}</TableCell>
                      <TableCell>
                        <Chip 
                          label={assignment.status} 
                          color={getStatusColor(assignment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(assignment.assigned_at)}</TableCell>
                      <TableCell>
                        {assignment.estimated_delivery ? formatDate(assignment.estimated_delivery) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {assignment.actual_delivery ? formatDate(assignment.actual_delivery) : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignmentDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Rider Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Rider</DialogTitle>
        <DialogContent>
          {editingRider && (
            <EditRiderForm 
              rider={editingRider} 
              onUpdate={handleUpdateRider}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

// Edit Rider Form Component
const EditRiderForm = ({ rider, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    vehicle_type: rider.vehicle_type || '',
    vehicle_number: rider.vehicle_number || '',
    delivery_zones: rider.delivery_zones || [],
    is_active: rider.is_active
  });
  const [newZone, setNewZone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(rider.id, formData);
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

        <Grid item xs={12}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1">Active Status</Typography>
            <Switch
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
            />
          </Box>
        </Grid>
      </Grid>

      <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="contained" color="primary">
          Update Rider
        </Button>
      </Box>
    </Box>
  );
};

export default AdminRidersPage; 