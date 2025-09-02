import React, { useState } from 'react';
import { API_BASE_URL } from '../../config';

  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Chip,
  Collapse,
  Paper
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const CouponInput = ({ orderTotal, onCouponApplied, onCouponRemoved, appliedCoupon }) => {
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [couponDetails, setCouponDetails] = useState(null);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('${API_BASE_URL}/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          order_total: orderTotal
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to validate coupon');
      }

      if (data.data && data.data.valid) {
        setSuccess('Coupon applied successfully!');
        setCouponDetails(data.data);
        onCouponApplied({
          code: couponCode.trim().toUpperCase(),
          discountAmount: data.data.discount_amount,
          finalAmount: data.data.final_amount,
          discountType: data.data.discount_type,
          discountValue: data.data.discount_value
        });
      } else {
        setError(data.data?.message || data.message || 'Invalid coupon code');
      }
    } catch (err) {
      setError(err.message || 'Failed to apply coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponDetails(null);
    setError('');
    setSuccess('');
    onCouponRemoved();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApplyCoupon();
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 2, border: '1px solid #dee2e6' }}>
      <Typography variant="h6" fontWeight="bold" color="#40513B" mb={2} display="flex" alignItems="center" gap={1}>
        <LocalOfferIcon />
        Apply Coupon
      </Typography>

      {appliedCoupon ? (
        <Box>
          <Alert 
            severity="success" 
            icon={<CheckCircleIcon />}
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={handleRemoveCoupon}>
                Remove
              </Button>
            }
          >
            Coupon <strong>{appliedCoupon.code}</strong> applied successfully!
          </Alert>
          
          <Box display="flex" flexDirection="column" gap={1} p={2} bgcolor="#f8f9fa" borderRadius={1}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">Original Total:</Typography>
              <Typography variant="body2" fontWeight="bold">৳{orderTotal.toFixed(2)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="success.main">
                Discount ({appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}%` : `৳${appliedCoupon.discountValue}`}):
              </Typography>
              <Typography variant="body2" color="success.main" fontWeight="bold">
                -৳{appliedCoupon.discountAmount.toFixed(2)}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body1" fontWeight="bold">Final Total:</Typography>
              <Typography variant="body1" fontWeight="bold" color="success.main">
                ৳{appliedCoupon.finalAmount.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box>
          <Box display="flex" gap={2} mb={2}>
            <TextField
              label="Enter Coupon Code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="e.g., SAVE20"
              fullWidth
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#9DC08B',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#40513B',
                  },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleApplyCoupon}
              disabled={loading || !couponCode.trim()}
              sx={{
                backgroundColor: '#40513B',
                '&:hover': { backgroundColor: '#2d3a2a' },
                minWidth: 120
              }}
            >
              {loading ? 'Applying...' : 'Apply'}
            </Button>
          </Box>

          <Collapse in={!!error}>
            <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 2 }}>
              {error}
            </Alert>
          </Collapse>

          <Collapse in={!!success}>
            <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2 }}>
              {success}
            </Alert>
          </Collapse>

          {couponDetails && (
            <Box display="flex" flexDirection="column" gap={1} p={2} bgcolor="#f8f9fa" borderRadius={1}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">Original Total:</Typography>
                <Typography variant="body2" fontWeight="bold">৳{orderTotal.toFixed(2)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="success.main">
                  Discount ({couponDetails.discount_type === 'percentage' ? `${couponDetails.discount_value}%` : `৳${couponDetails.discount_value}`}):
                </Typography>
                <Typography variant="body2" color="success.main" fontWeight="bold">
                  -৳{couponDetails.discount_amount.toFixed(2)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body1" fontWeight="bold">Final Total:</Typography>
                <Typography variant="body1" fontWeight="bold" color="success.main">
                  ৳{couponDetails.final_amount.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default CouponInput; 