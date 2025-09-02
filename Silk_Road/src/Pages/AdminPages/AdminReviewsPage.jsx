import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { useAuth } from '../../AuthContext';

const AdminReviewsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customerMap, setCustomerMap] = useState({});

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchReviews();
  }, [user, navigate]);

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8000/api/v1/reviews/');
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setReviews(data.reviews || []);
      // Step 2: Extract unique customer_ids
      const customerIds = [...new Set((data.reviews || []).map(r => r.customer_id))];
      // Step 3: Fetch all customers in parallel
      const customerPromises = customerIds.map(id =>
        fetch(`http://localhost:8000/api/v1/customers/${id}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => data?.data ? { id, name: `${data.data.first_name} ${data.data.last_name}` } : { id, name: "Unknown" })
      );
      const customers = await Promise.all(customerPromises);
      // Step 4: Map customer_id to name
      const map = {};
      customers.forEach(c => { map[c.id] = c.name; });
      setCustomerMap(map);
    } catch (err) {
      setError('Failed to load reviews. Please try again.');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #9DC08B 0%, #40513B 100%)',
      p: 3
    }}>
      <Paper sx={{
        p: 4,
        borderRadius: 3,
        boxShadow: 3,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box display="flex" alignItems="center" gap={2}>
            <StarIcon sx={{ fontSize: 40, color: '#40513B' }} />
            <Typography variant="h4" fontWeight="bold" color="#40513B">
              Review Management
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => navigate('/admin')}
            sx={{
              borderColor: '#40513B',
              color: '#40513B',
              '&:hover': {
                borderColor: '#2d3a2a',
                backgroundColor: '#9DC08B20'
              }
            }}
          >
            Back to Dashboard
          </Button>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Reviews Table */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress size={60} sx={{ color: '#40513B' }} />
          </Box>
        ) : (
          <Card sx={{
            border: '1px solid #dee2e6',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold" color="#40513B">
                  All Reviews ({reviews.length})
                </Typography>
                <Button
                  variant="contained"
                  onClick={fetchReviews}
                  sx={{
                    backgroundColor: '#40513B',
                    '&:hover': { backgroundColor: '#2d3a2a' }
                  }}
                >
                  Refresh
                </Button>
              </Box>

              {reviews.length === 0 ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                  <Typography variant="h6" color="text.secondary">
                    No reviews found
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{
                  boxShadow: 2,
                  border: '1px solid #dee2e6'
                }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                        <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Review ID</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Product</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>User</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Rating</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Comment</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reviews.map((review) => (
                        <TableRow key={review.id} hover sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              #{review.id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {review.product_name || review.product_id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {customerMap[review.customer_id] || review.customer_id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={<StarIcon sx={{ color: '#ffc107' }} />}
                              label={review.rating}
                              color="warning"
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {review.comment}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {review.review_date ? new Date(review.review_date).toLocaleDateString() : ''}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        )}
      </Paper>
    </Box>
  );
};

export default AdminReviewsPage; 