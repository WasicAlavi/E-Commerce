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
  CircularProgress,
  TextField
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import { useAuth } from '../../AuthContext';

const AdminUsersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8000/api/v1/users/');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter users by name or user ID
  const filteredUsers = users.filter(u => {
    const name = (u.name || u.username || '').toLowerCase();
    const id = String(u.id);
    return name.includes(debouncedSearch.toLowerCase()) || id.includes(debouncedSearch);
  });

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
            <PeopleIcon sx={{ fontSize: 40, color: '#40513B' }} />
            <Typography variant="h4" fontWeight="bold" color="#40513B">
              User Management
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

        {/* Users Table */}
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
                  All Users ({filteredUsers.length})
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={fetchUsers}
                  sx={{ 
                    backgroundColor: '#40513B',
                    '&:hover': { backgroundColor: '#2d3a2a' }
                  }}
                >
                  Refresh
                </Button>
              </Box>
              <Box mb={2}>
                <TextField
                  label="Search by name or user ID"
                  variant="outlined"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  fullWidth
                  sx={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: 2
                  }}
                />
              </Box>
              
              {filteredUsers.length === 0 ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                  <Typography variant="h6" color="text.secondary">
                    No users found
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
                        <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>ID</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Name/Username</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Role</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#40513B' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} hover sx={{ '&:hover': { backgroundColor: '#f8f9fa', cursor: 'pointer' } }} onClick={() => navigate(`/admin/users/${user.id}`)}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              #{user.id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {user.name || user.username}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.role || 'customer'}
                              color={user.role === 'admin' ? 'error' : 'default'}
                              size="small"
                              variant="outlined"
                              sx={{
                                '&.MuiChip-colorError': {
                                  borderColor: '#dc3545',
                                  color: '#dc3545'
                                },
                                '&.MuiChip-colorDefault': {
                                  borderColor: '#6c757d',
                                  color: '#6c757d'
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label="Active"
                              color="success"
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: '#28a745',
                                color: '#28a745'
                              }}
                            />
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

export default AdminUsersPage; 