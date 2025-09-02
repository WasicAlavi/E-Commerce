import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
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
  TableSortLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Badge,
  Tabs,
  Tab,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import { useAuth } from '../../AuthContext';
import ProductForm from '../../components/Admin/ProductForm';

const headCells = [
  { id: 'id', label: 'ID' },
  { id: 'name', label: 'Name' },
  { id: 'price', label: 'Price' },
  { id: 'stock', label: 'Stock' },
  { id: 'rating', label: 'Rating' },
  { id: 'category', label: 'Category' },
  { id: 'actions', label: 'Actions' },
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}
function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const AdminProductsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderBy, setOrderBy] = useState('id');
  const [order, setOrder] = useState('asc');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    lowStock: false
  });
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0
  });

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
    fetchProducts();
  }, [user, navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('${API_BASE_URL}/products/admin/all');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      const productsData = data || [];
      setProducts(productsData);
      
      // Calculate stats
      const total = productsData.length;
      const inStock = productsData.filter(p => p.stock > 10).length;
      const lowStock = productsData.filter(p => p.stock > 0 && p.stock <= 10).length;
      const outOfStock = productsData.filter(p => p.stock === 0).length;
      
      setStats({ total, inStock, lowStock, outOfStock });
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleRowClick = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  const handleProductSave = async (updatedProduct) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      });
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      await fetchProducts();
      handleModalClose();
    } catch (err) {
      alert('Failed to update product: ' + err.message);
    }
  };

  // Enhanced filtering and search
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                         product.description?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(debouncedSearch.toLowerCase());
    
    const matchesCategory = !filters.category || 
                           product.tags?.some(tag => tag.name?.toLowerCase().includes(filters.category.toLowerCase()));
    
    const matchesPrice = (!filters.minPrice || product.price >= parseFloat(filters.minPrice)) &&
                        (!filters.maxPrice || product.price <= parseFloat(filters.maxPrice));
    
    const matchesStock = !filters.inStock || product.stock > 0;
    const matchesLowStock = !filters.lowStock || (product.stock > 0 && product.stock <= 10);
    
    return matchesSearch && matchesCategory && matchesPrice && matchesStock && matchesLowStock;
  });

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchProducts();
        setError('');
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (err) {
      setError('Failed to delete product: ' + err.message);
    }
  };

  const handleAddProductSuccess = () => {
    setShowAddProduct(false);
    fetchProducts();
  };

  const exportProducts = () => {
    const csvContent = [
      ['ID', 'Name', 'Description', 'Price', 'Stock', 'Brand', 'Category'].join(','),
      ...filteredProducts.map(product => [
        product.id,
        `"${product.name}"`,
        `"${product.description || ''}"`,
        product.price,
        product.stock,
        `"${product.brand || ''}"`,
        `"${product.tags?.map(tag => tag.name).join(', ') || ''}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
            <InventoryIcon sx={{ fontSize: 40, color: '#40513B' }} />
            <Typography variant="h4" fontWeight="bold" color="#40513B">
              Product Management
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddProduct(true)}
              sx={{
                backgroundColor: '#40513B',
                '&:hover': { backgroundColor: '#2d3a2a' },
                borderRadius: 2
              }}
            >
              Add Product
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportProducts}
              sx={{
                borderColor: '#40513B',
                color: '#40513B',
                '&:hover': { backgroundColor: '#9DC08B20' }
              }}
            >
              Export
            </Button>
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
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              backgroundColor: '#e8f5e8', 
              border: '1px solid #9DC08B',
              borderRadius: 2
            }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="#40513B" fontWeight="bold">
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="#666">
                  Total Products
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              backgroundColor: '#e3f2fd', 
              border: '1px solid #2196f3',
              borderRadius: 2
            }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="#1976d2" fontWeight="bold">
                  {stats.inStock}
                </Typography>
                <Typography variant="body2" color="#666">
                  In Stock
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              backgroundColor: '#fff3e0', 
              border: '1px solid #ff9800',
              borderRadius: 2
            }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="#f57c00" fontWeight="bold">
                  {stats.lowStock}
                </Typography>
                <Typography variant="body2" color="#666">
                  Low Stock
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              backgroundColor: '#ffebee', 
              border: '1px solid #f44336',
              borderRadius: 2
            }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="#d32f2f" fontWeight="bold">
                  {stats.outOfStock}
                </Typography>
                <Typography variant="body2" color="#666">
                  Out of Stock
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Search and Filters */}
        <Card sx={{ mb: 3, border: '1px solid #dee2e6' }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Search products"
                  variant="outlined"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#666' }} />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Search by name, description, or brand..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#f8f9fa'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  label="Min Price"
                  variant="outlined"
                  type="number"
                  value={filters.minPrice}
                  onChange={e => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                  fullWidth
                  InputProps={{
                    startAdornment: <InputAdornment position="start">৳</InputAdornment>,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#f8f9fa'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  label="Max Price"
                  variant="outlined"
                  type="number"
                  value={filters.maxPrice}
                  onChange={e => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                  fullWidth
                  InputProps={{
                    startAdornment: <InputAdornment position="start">৳</InputAdornment>,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#f8f9fa'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    label="Category"
                    sx={{
                      borderRadius: 2,
                      backgroundColor: '#f8f9fa'
                    }}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    <MenuItem value="Electronics">Electronics</MenuItem>
                    <MenuItem value="Clothing">Clothing</MenuItem>
                    <MenuItem value="Books">Books</MenuItem>
                    <MenuItem value="Home">Home & Garden</MenuItem>
                    <MenuItem value="Sports">Sports</MenuItem>
                    <MenuItem value="Beauty">Beauty</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Box display="flex" gap={1} alignItems="center" height="100%">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.inStock}
                        onChange={e => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
                        color="primary"
                      />
                    }
                    label="In Stock"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.lowStock}
                        onChange={e => setFilters(prev => ({ ...prev, lowStock: e.target.checked }))}
                        color="warning"
                      />
                    }
                    label="Low Stock"
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Products Table */}
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
                  Products ({filteredProducts.length} of {products.length})
                </Typography>
                <Box display="flex" gap={1}>
                  <Tooltip title="Refresh products">
                    <IconButton onClick={fetchProducts} sx={{ color: '#40513B' }}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {filteredProducts.length === 0 ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                  <Typography variant="h6" color="text.secondary">
                    No products found
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
                        {headCells.map((headCell) => (
                          <TableCell key={headCell.id} sx={{ fontWeight: 'bold', color: '#40513B' }}>
                            <TableSortLabel
                              active={orderBy === headCell.id}
                              direction={orderBy === headCell.id ? order : 'asc'}
                              onClick={() => handleRequestSort(headCell.id)}
                            >
                              {headCell.label}
                            </TableSortLabel>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[...filteredProducts].sort(getComparator(order, orderBy)).map((product) => (
                        <TableRow key={product.id} hover sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              #{product.id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {product.name}
                              </Typography>
                              {product.brand && (
                                <Typography variant="caption" color="text.secondary">
                                  {product.brand}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold" color="#40513B">
                              ৳{product.price?.toFixed(2) || product.price || '0.00'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={product.stock}
                              size="small"
                              color={
                                product.stock === 0 ? 'error' :
                                product.stock <= 10 ? 'warning' : 'success'
                              }
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Typography variant="body2" fontWeight="bold" color={product.rating > 0 ? '#40513B' : '#999'}>
                                {product.rating?.toFixed(1) || '0.0'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">/5</Typography>
                              {product.reviews > 0 && (
                                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                  ({product.reviews} reviews)
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1} flexWrap="wrap">
                              {product.tags && product.tags.length > 0
                                ? product.tags.slice(0, 2).map((tag, idx) => (
                                    <Chip key={idx} label={tag.name} size="small" color="info" variant="outlined" />
                                  ))
                                : <Typography variant="body2" color="text.secondary">No tags</Typography>
                              }
                              {product.tags && product.tags.length > 2 && (
                                <Chip label={`+${product.tags.length - 2}`} size="small" color="default" variant="outlined" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <Tooltip title="View details">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleRowClick(product)}
                                  sx={{ color: '#40513B' }}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit product">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleRowClick(product)}
                                  sx={{ color: '#9DC08B' }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete product">
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProduct(product.id);
                                  }}
                                  sx={{ color: '#f44336' }}
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
            </CardContent>
          </Card>
        )}

        {/* Add Product Form */}
        {showAddProduct && (
          <ProductForm
            onClose={() => setShowAddProduct(false)}
            onSuccess={handleAddProductSuccess}
          />
        )}

        {/* Product Details Modal */}
        {selectedProduct && (
          <Dialog open={modalOpen} onClose={handleModalClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ 
              backgroundColor: '#f8f9fa', 
              borderBottom: '1px solid #dee2e6',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <EditIcon sx={{ color: '#40513B' }} />
              <Typography component="span" variant="h6" fontWeight="bold" color="#40513B">
                Edit Product - {selectedProduct.name}
              </Typography>
            </DialogTitle>
            <DialogContent dividers sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Product Name"
                    value={selectedProduct.name}
                    onChange={e => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                    fullWidth
                    required
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Description"
                    value={selectedProduct.description || ''}
                    onChange={e => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
                    fullWidth
                    multiline
                    rows={3}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Brand"
                    value={selectedProduct.brand || ''}
                    onChange={e => setSelectedProduct({ ...selectedProduct, brand: e.target.value })}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Price (৳)"
                    type="number"
                    value={selectedProduct.price}
                    onChange={e => setSelectedProduct({ ...selectedProduct, price: parseFloat(e.target.value) })}
                    fullWidth
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Stock Quantity"
                    type="number"
                    value={selectedProduct.stock}
                    onChange={e => setSelectedProduct({ ...selectedProduct, stock: parseInt(e.target.value) })}
                    fullWidth
                    required
                    inputProps={{ min: 0 }}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Image URL"
                    value={selectedProduct.image_url || ''}
                    onChange={e => setSelectedProduct({ ...selectedProduct, image_url: e.target.value })}
                    fullWidth
                    placeholder="https://example.com/image.jpg"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                    Product Categories/Tags
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {selectedProduct.tags && selectedProduct.tags.length > 0
                      ? selectedProduct.tags.map((tag, idx) => (
                          <Chip key={idx} label={tag.name} size="medium" color="primary" variant="outlined" />
                        ))
                      : <Typography variant="body2" color="text.secondary">No categories assigned</Typography>
                    }
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ 
              p: 3, 
              backgroundColor: '#f8f9fa',
              borderTop: '1px solid #dee2e6'
            }}>
              <Button 
                onClick={handleModalClose} 
                sx={{ color: '#666' }}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => handleProductSave(selectedProduct)} 
                variant="contained" 
                sx={{ 
                  backgroundColor: '#40513B',
                  '&:hover': { backgroundColor: '#2d3a2a' },
                  borderRadius: 2,
                  px: 3
                }}
              >
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Paper>
    </Box>
  );
};

export default AdminProductsPage; 