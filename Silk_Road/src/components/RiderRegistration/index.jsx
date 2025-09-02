import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Paper
} from '@mui/material';
import {
  LocalShipping as LocalShippingIcon,
  DirectionsCar as DirectionsCarIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material';
import { useAuth } from '../../AuthContext';
import authService from '../../services/authService';
import riderService from '../../services/riderService';

const RiderRegistration = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    vehicle_type: '',
    vehicle_number: '',
    delivery_zones: []
  });
  const [newZone, setNewZone] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.vehicle_type) {
      setError('Please select a vehicle type');
      return;
    }

    if (formData.delivery_zones.length === 0) {
      setError('Please add at least one delivery zone');
      return;
    }

    setLoading(true);
    setError('');
    
    // Debug: Check authentication status
    console.log('User authentication status:', authService.isAuthenticated());
    console.log('Current user:', authService.getCurrentUser());
    console.log('Form data:', formData);
    
    // Test authentication first
    try {
      await riderService.testAuth();
      console.log('Authentication test passed');
    } catch (authError) {
      console.error('Authentication test failed:', authError);
      setError('Authentication failed. Please log in again.');
      return;
    }
    
    try {
      await riderService.registerAsRider(formData);
      setSuccess('Successfully registered as a rider!');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error registering as rider:', err);
      setError('Failed to register as rider: ' + err.message);
    } finally {
      setLoading(false);
    }
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddZone();
    }
  };

  if (!user) {
    return (
      <Alert severity="warning">
        Please log in to register as a rider.
      </Alert>
    );
  }

  if (!authService.isAuthenticated()) {
    return (
      <Alert severity="error">
        You are not authenticated. Please log in again.
        <br />
        <Button 
          variant="text" 
          size="small" 
          onClick={() => window.location.href = '/login'}
          sx={{ mt: 1, p: 0, minWidth: 'auto' }}
        >
          Go to Login
        </Button>
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
      <Box component="form" onSubmit={handleSubmit}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <LocalShippingIcon sx={{ fontSize: 40, color: '#40513B' }} />
          <Typography variant="h4" fontWeight="bold" color="#40513B">
            Register as Rider
          </Typography>
        </Box>

        {/* Help Message */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Before registering:</strong> Make sure you have completed your customer profile with your name and contact information.
            <br />
            You can update your profile in the Profile section.
            <br />
            <strong>Note:</strong> If you get a "Customer profile not found" error, please complete your profile first.
          </Typography>
        </Alert>

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

        {/* Test Authentication Button */}
        <Box display="flex" justifyContent="center" mb={3}>
          <Button
            variant="outlined"
            onClick={async () => {
              try {
                await riderService.testAuth();
                setSuccess('Authentication test passed!');
              } catch (err) {
                setError('Authentication test failed: ' + err.message);
              }
            }}
            sx={{ borderColor: '#40513B', color: '#40513B' }}
          >
            Test Authentication
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Vehicle Information */}
          <Grid xs={12} md={6}>
            <Card sx={{ border: '1px solid #dee2e6', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <DirectionsCarIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold" color="#40513B">
                    Vehicle Information
                  </Typography>
                </Box>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Vehicle Type *</InputLabel>
                  <Select
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, vehicle_type: e.target.value }))}
                    label="Vehicle Type *"
                    required
                  >
                    <MenuItem value="bike">Bike</MenuItem>
                    <MenuItem value="car">Car</MenuItem>
                    <MenuItem value="van">Van</MenuItem>
                    <MenuItem value="truck">Truck</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Vehicle Number (Optional)"
                  value={formData.vehicle_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, vehicle_number: e.target.value }))}
                  placeholder="e.g., ABC-123"
                  helperText="Enter your vehicle registration number if applicable"
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Delivery Zones */}
          <Grid xs={12} md={6}>
            <Card sx={{ border: '1px solid #dee2e6', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <LocationOnIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold" color="#40513B">
                    Delivery Zones *
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" mb={2}>
                  Add the areas where you can make deliveries
                </Typography>

                <Box display="flex" gap={1} mb={2}>
                  <TextField
                    size="small"
                    label="Add Zone"
                    value={newZone}
                    onChange={(e) => setNewZone(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g., Downtown, North Area"
                    fullWidth
                  />
                  <Button 
                    variant="outlined" 
                    onClick={handleAddZone}
                    disabled={!newZone.trim()}
                    sx={{ minWidth: 'auto', px: 2 }}
                  >
                    Add
                  </Button>
                </Box>

                <Box display="flex" gap={1} flexWrap="wrap" minHeight={60}>
                  {formData.delivery_zones.map((zone, index) => (
                    <Chip
                      key={index}
                      label={zone}
                      onDelete={() => handleRemoveZone(zone)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                  {formData.delivery_zones.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No zones added yet
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Terms and Conditions */}
        <Card sx={{ mt: 3, border: '1px solid #dee2e6', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" color="#40513B" mb={2}>
              Terms & Conditions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              By registering as a rider, you agree to:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 2 }}>
              <Typography component="li" variant="body2" color="text.secondary">
                Maintain a valid driver's license and vehicle insurance
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Follow all traffic laws and safety regulations
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Provide accurate delivery information and updates
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Maintain professional conduct with customers
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Accept responsibility for the safe delivery of orders
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              You can update your profile and delivery zones at any time from your rider dashboard.
            </Typography>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box display="flex" gap={2} justifyContent="flex-end" mt={4}>
          <Button 
            onClick={async () => {
              try {
                console.log('Testing authentication...');
                const result = await riderService.testAuth();
                console.log('Auth test result:', result);
                setSuccess('Authentication test successful!');
              } catch (error) {
                console.error('Auth test failed:', error);
                setError('Authentication test failed: ' + error.message);
              }
            }}
            variant="outlined"
            sx={{ 
              borderColor: '#9DC08B',
              color: '#9DC08B',
              '&:hover': { 
                borderColor: '#40513B',
                backgroundColor: '#9DC08B10'
              }
            }}
          >
            Test Auth
          </Button>
          {onCancel && (
            <Button 
              onClick={onCancel}
              variant="outlined"
              sx={{ 
                borderColor: '#40513B',
                color: '#40513B',
                '&:hover': { 
                  borderColor: '#2d3a2a',
                  backgroundColor: '#40513B10'
                }
              }}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit"
            variant="contained"
            disabled={loading || !formData.vehicle_type || formData.delivery_zones.length === 0}
            startIcon={loading ? <CircularProgress size={20} /> : <LocalShippingIcon />}
            sx={{ 
              backgroundColor: '#40513B',
              '&:hover': { backgroundColor: '#2d3a2a' },
              px: 4
            }}
          >
            {loading ? 'Registering...' : 'Register as Rider'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default RiderRegistration; 