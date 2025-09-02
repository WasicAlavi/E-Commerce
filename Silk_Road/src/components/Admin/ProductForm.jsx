import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Autocomplete,
  Chip,
  InputAdornment,
  Tooltip,
  IconButton,
  Divider,
  FormHelperText,
  Paper
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CategoryIcon from '@mui/icons-material/Category';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ImageIcon from '@mui/icons-material/Image';

const ProductForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    brand: '',
    image_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categorySuggestions, setCategorySuggestions] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popularCategories] = useState([
    'Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Beauty', 'Toys', 'Automotive',
    'Fashion', 'Accessories', 'Shoes', 'Bags', 'Jewelry', 'Watches', 'Sunglasses',
    'Home Decor', 'Kitchen', 'Furniture', 'Lighting', 'Bedding', 'Bathroom',
    'Health & Wellness', 'Fitness', 'Nutrition', 'Personal Care', 'Skincare',
    'Technology', 'Computers', 'Mobile Phones', 'Tablets', 'Gaming', 'Audio',
    'Automotive', 'Car Accessories', 'Motorcycle', 'Bicycle', 'Tools',
    'Baby & Kids', 'Toys & Games', 'Baby Care', 'Kids Fashion', 'Education',
    'Office & Business', 'Stationery', 'Office Furniture', 'Business Supplies'
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Enhanced validation function
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Product name must be at least 3 characters';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Product name must be less than 100 characters';
    }
    
    if (!formData.price) {
      errors.price = 'Price is required';
    } else if (parseFloat(formData.price) <= 0) {
      errors.price = 'Price must be greater than 0';
    } else if (parseFloat(formData.price) > 999999) {
      errors.price = 'Price must be less than 1,000,000';
    }
    
    if (!formData.stock) {
      errors.stock = 'Stock quantity is required';
    } else if (parseInt(formData.stock) < 0) {
      errors.stock = 'Stock quantity cannot be negative';
    } else if (parseInt(formData.stock) > 999999) {
      errors.stock = 'Stock quantity must be less than 1,000,000';
    }
    
    if (!formData.category.trim()) {
      errors.category = 'Category is required';
    } else if (formData.category.trim().length < 2) {
      errors.category = 'Category must be at least 2 characters';
    }
    
    if (formData.description && formData.description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }
    
    if (formData.brand && formData.brand.length > 50) {
      errors.brand = 'Brand must be less than 50 characters';
    }
    
    if (formData.image_url && !isValidUrl(formData.image_url)) {
      errors.image_url = 'Please enter a valid image URL';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // URL validation helper
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Enhanced category suggestions with debouncing
  const fetchCategorySuggestions = async (query) => {
    if (!query || query.length < 2) {
      setCategorySuggestions([]);
      return;
    }

    setCategoryLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/products/categories/suggestions?query=${encodeURIComponent(query)}&limit=15`);
      if (response.ok) {
        const data = await response.json();
        const apiSuggestions = data.suggestions || [];
        
        // Combine API suggestions with popular categories that match the query
        const matchingPopular = popularCategories.filter(cat => 
          cat.toLowerCase().includes(query.toLowerCase())
        ).map(cat => ({
          name: cat,
          usage_count: 0,
          is_popular: true
        }));
        
        // Merge and deduplicate suggestions
        const allSuggestions = [...apiSuggestions, ...matchingPopular];
        const uniqueSuggestions = allSuggestions.filter((suggestion, index, self) => 
          index === self.findIndex(s => s.name.toLowerCase() === suggestion.name.toLowerCase())
        );
        
        setCategorySuggestions(uniqueSuggestions);
      } else {
        console.error('Failed to fetch category suggestions');
        // Fallback to popular categories
        const matchingPopular = popularCategories.filter(cat => 
          cat.toLowerCase().includes(query.toLowerCase())
        ).map(cat => ({
          name: cat,
          usage_count: 0,
          is_popular: true
        }));
        setCategorySuggestions(matchingPopular);
      }
    } catch (error) {
      console.error('Error fetching category suggestions:', error);
      // Fallback to popular categories
      const matchingPopular = popularCategories.filter(cat => 
        cat.toLowerCase().includes(query.toLowerCase())
      ).map(cat => ({
        name: cat,
        usage_count: 0,
        is_popular: true
      }));
      setCategorySuggestions(matchingPopular);
    } finally {
      setCategoryLoading(false);
    }
  };

  // Debounced category search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.category && formData.category.length >= 2) {
        fetchCategorySuggestions(formData.category);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formData.category]);

  // Handle category input change
  const handleCategoryChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      category: newValue || ''
    }));
    
    // Clear validation error
    if (validationErrors.category) {
      setValidationErrors(prev => ({
        ...prev,
        category: ''
      }));
    }
  };

  // Handle category input typing
  const handleCategoryInputChange = (event, newInputValue) => {
    setFormData(prev => ({
      ...prev,
      category: newInputValue
    }));
  };

  // Handle popular category selection
  const handlePopularCategorySelect = (category) => {
    setFormData(prev => ({
      ...prev,
      category: category
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      setError('Please fix the validation errors below');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8000/api/v1/products/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          brand: formData.brand || null,
          material: null,
          colors: null,
          sizes: null,
          care_instructions: null,
          features: null,
          specifications: null,
          category: formData.category || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create product');
      }

      const result = await response.json();
      setSuccess('Product created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        brand: '',
        image_url: ''
      });

      // Call success callback after a short delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }, 1500);

    } catch (err) {
      console.error('Error creating product:', err);
      setError(err.message || 'Failed to create product. Please try again.');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={true} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: 3,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: '#f8f9fa', 
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <CloudUploadIcon sx={{ color: '#40513B' }} />
          <Typography component="span" variant="h6" fontWeight="bold" color="#40513B">
            Add New Product
          </Typography>
        </Box>
        <Tooltip title="Product creation help">
          <IconButton size="small">
            <HelpOutlineIcon sx={{ color: '#666' }} />
          </IconButton>
        </Tooltip>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {/* Popular Categories Section */}
          <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <CategoryIcon sx={{ color: '#40513B' }} />
              <Typography variant="subtitle1" fontWeight="bold" color="#40513B">
                Popular Categories
              </Typography>
            </Box>
            <Box display="flex" gap={1} flexWrap="wrap">
              {popularCategories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  onClick={() => handlePopularCategorySelect(category)}
                  variant={formData.category === category ? "filled" : "outlined"}
                  color={formData.category === category ? "primary" : "default"}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#e3f2fd' }
                  }}
                />
              ))}
            </Box>
          </Paper>

          {/* Helpful Tips Section */}
          <Paper sx={{ p: 2, mb: 3, backgroundColor: '#e8f5e8', border: '1px solid #9DC08B' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <HelpOutlineIcon sx={{ color: '#40513B' }} />
              <Typography variant="subtitle1" fontWeight="bold" color="#40513B">
                Quick Tips
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="#666" sx={{ mb: 1 }}>
                • <strong>Category:</strong> Start typing to see suggestions or click on popular categories above
              </Typography>
              <Typography variant="body2" color="#666" sx={{ mb: 1 }}>
                • <strong>Price:</strong> Enter the price in Bangladeshi Taka (৳)
              </Typography>
              <Typography variant="body2" color="#666" sx={{ mb: 1 }}>
                • <strong>Stock:</strong> Set initial inventory quantity
              </Typography>
              <Typography variant="body2" color="#666">
                • <strong>Image URL:</strong> Use a direct link to the product image (optional)
              </Typography>
            </Box>
          </Paper>

          <Grid container spacing={3}>
            {/* First Column - Basic Information */}
            <Grid xs={12} md={6}>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="#40513B" mb={2}>
                  Basic Information
                </Typography>
                
                <TextField
                  name="name"
                  label="Product Name *"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                  error={!!validationErrors.name}
                  helperText={validationErrors.name}
                  placeholder="Enter product name (3-100 characters)"
                  sx={{ mb: 2, 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#9DC08B'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#40513B'
                      }
                    }
                  }}
                />

                <TextField
                  name="description"
                  label="Description"
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  error={!!validationErrors.description}
                  helperText={validationErrors.description || `${formData.description.length}/1000 characters`}
                  placeholder="Enter product description (optional, max 1000 characters)"
                  sx={{ mb: 2,
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#9DC08B'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#40513B'
                      }
                    }
                  }}
                />

                <TextField
                  name="brand"
                  label="Brand"
                  value={formData.brand}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  error={!!validationErrors.brand}
                  helperText={validationErrors.brand}
                  placeholder="Enter brand name (optional)"
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#9DC08B'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#40513B'
                      }
                    }
                  }}
                />
              </Box>
            </Grid>

            {/* Second Column - Pricing & Inventory */}
            <Grid xs={12} md={6}>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="#40513B" mb={2}>
                  Pricing & Inventory
                </Typography>
                
                <TextField
                  name="price"
                  label="Price (৳) *"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                  error={!!validationErrors.price}
                  helperText={validationErrors.price}
                  inputProps={{ min: 0, step: 0.01 }}
                  placeholder="0.00"
                  sx={{ mb: 2,
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#9DC08B'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#40513B'
                      }
                    }
                  }}
                />

                <TextField
                  name="stock"
                  label="Stock Quantity *"
                  type="number"
                  value={formData.stock}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                  error={!!validationErrors.stock}
                  helperText={validationErrors.stock}
                  inputProps={{ min: 0 }}
                  placeholder="0"
                  sx={{ mb: 2,
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#9DC08B'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#40513B'
                      }
                    }
                  }}
                />

                <Autocomplete
                  freeSolo
                  options={categorySuggestions.map(suggestion => suggestion.name)}
                  value={formData.category}
                  onChange={handleCategoryChange}
                  onInputChange={handleCategoryInputChange}
                  loading={categoryLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Category *"
                      variant="outlined"
                      fullWidth
                      required
                      error={!!validationErrors.category}
                      helperText={validationErrors.category}
                      placeholder="Start typing to see suggestions..."
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {categoryLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#9DC08B'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#40513B'
                          }
                        }
                      }}
                    />
                  )}
                  renderOption={(props, option) => {
                    const suggestion = categorySuggestions.find(s => s.name === option);
                    return (
                      <Box component="li" {...props}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                          <Box>
                            <Typography variant="body1" fontWeight={suggestion?.is_popular ? 'bold' : 'normal'}>
                              {option}
                            </Typography>
                            {suggestion?.is_popular && (
                              <Typography variant="caption" color="text.secondary">
                                Popular
                              </Typography>
                            )}
                          </Box>
                          {suggestion?.is_popular && (
                            <Chip 
                              label="Popular" 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      </Box>
                    );
                  }}
                  noOptionsText="No categories found. You can type a new category."
                  loadingText="Loading categories..."
                  filterOptions={(options, { inputValue }) => {
                    // Custom filter to show all suggestions when typing
                    return options;
                  }}
                />
              </Box>
            </Grid>

            {/* Full Width - Image URL and Preview */}
            <Grid xs={12}>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" fontWeight="bold" color="#40513B" mb={2}>
                Product Image
              </Typography>
              
              <TextField
                name="image_url"
                label="Image URL"
                value={formData.image_url}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                error={!!validationErrors.image_url}
                helperText={validationErrors.image_url}
                placeholder="https://example.com/image.jpg (optional)"
                sx={{ mb: 2,
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#9DC08B'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#40513B'
                    }
                  }
                }}
              />
              
              {formData.image_url && isValidUrl(formData.image_url) && (
                <Box display="flex" justifyContent="center">
                  <Paper sx={{ p: 2, border: '1px solid #dee2e6', backgroundColor: '#f8f9fa' }}>
                    <Typography variant="subtitle2" color="#666" mb={1} textAlign="center">
                      Image Preview
                    </Typography>
                    <img 
                      src={formData.image_url} 
                      alt="Product preview" 
                      style={{ 
                        maxWidth: '250px', 
                        maxHeight: '250px', 
                        objectFit: 'contain',
                        borderRadius: '8px',
                        border: '1px solid #dee2e6'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </Paper>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #dee2e6'
        }}>
          <Button 
            onClick={onClose} 
            disabled={loading}
            sx={{ 
              color: '#666',
              '&:hover': { backgroundColor: '#e0e0e0' }
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : null}
            sx={{ 
              backgroundColor: '#40513B',
              '&:hover': { backgroundColor: '#2d3a2a' },
              '&:disabled': { backgroundColor: '#ccc' },
              borderRadius: 2,
              px: 3
            }}
          >
            {loading ? 'Creating...' : 'Create Product'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProductForm; 