import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Rating from '@mui/material/Rating';
import { FaTrash, FaShoppingCart, FaHeart, FaArrowLeft } from 'react-icons/fa';
import CompareService from '../../services/compareService';
import cartService from '../../services/cartService';
import wishlistService from '../../services/wishlistService';
import Recommendations from '../../components/Recommendations';
import { useAuth } from '../../AuthContext';
import CustomAlert from '../../components/Alert';

const StyledButton = styled(Button)(({ theme }) => ({
  fontFamily: 'Montserrat, sans-serif',
  backgroundColor: '#9DC08B',
  color: '#fff',
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 500,
  padding: '10px 20px',
  '&:hover': {
    backgroundColor: '#40513B',
  },
}));

const CompareProducts = () => {
  const { user: currentUser } = useAuth();
  const [compareItems, setCompareItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Alert state management
  const [alert, setAlert] = useState({
    show: false,
    severity: 'info',
    title: '',
    message: ''
  });

  // Function to show custom alert
  const showAlert = (severity, title, message) => {
    setAlert({
      show: true,
      severity,
      title,
      message
    });
  };

  // Function to hide alert
  const hideAlert = () => {
    setAlert({
      show: false,
      severity: 'info',
      title: '',
      message: ''
    });
  };

  // Load compare products on component mount
  useEffect(() => {
    loadCompareProducts();
  }, []);

  const loadCompareProducts = async () => {
    try {
      setLoading(true);
      const products = await CompareService.getCompareProducts();
      setCompareItems(products);
    } catch (error) {
      console.error('Error loading compare products:', error);
      showAlert('error', 'Error', 'Failed to load compare products');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCompare = (itemId) => {
    try {
      const result = CompareService.removeFromCompare(itemId);
      setCompareItems(prevItems => prevItems.filter(item => item.id !== itemId));
      showAlert(result.success ? 'success' : 'error', 
               result.success ? 'Removed' : 'Error', 
               result.message);
    } catch (error) {
      console.error('Error removing from compare:', error);
      showAlert('error', 'Error', 'Failed to remove product from comparison');
    }
  };

  const addToCart = async (item) => {
    try {
      if (!currentUser) {
        showAlert('warning', 'Login Required', 'Please log in to add items to cart');
        return;
      }

      const cart = await cartService.getOrCreateCart();
      await cartService.addItemToCart(cart.id, item.id, 1);
      
      showAlert('success', 'Added to Cart', 'Product added to cart successfully');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showAlert('error', 'Error', 'Failed to add product to cart');
    }
  };

  const addToWishlist = async (item) => {
    try {
      if (!currentUser) {
        showAlert('warning', 'Login Required', 'Please log in to use wishlist');
        return;
      }

      const wishlist = await wishlistService.getOrCreateWishlist();
      const payload = { product_id: item.id };
      const url = `http://localhost:8000/api/v1/wishlists/${wishlist.id}/items`;
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        showAlert('success', 'Added to Wishlist', 'Product added to wishlist successfully');
      } else {
        showAlert('error', 'Error', 'Failed to add product to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      showAlert('error', 'Error', 'Failed to add product to wishlist');
    }
  };

  if (loading) {
    return (
      <div className="bg-[#EDF6E5] min-h-screen py-12 font-montserrat">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#40513B] mb-4">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (compareItems.length === 0) {
    return (
      <div className="bg-[#EDF6E5] min-h-screen py-12 font-montserrat">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#40513B] mb-4">No Products to Compare</h2>
            <p className="text-lg text-[#40513B] mb-8">
              Add products to your compare list to see them side by side.
            </p>
            <Link to="/">
              <StyledButton variant="contained" startIcon={<FaArrowLeft />}>
                Start Shopping
              </StyledButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const comparisonFields = [
    { key: 'price', label: 'Price' },
    { key: 'rating', label: 'Rating' },
    { key: 'brand', label: 'Brand' },
    { key: 'material', label: 'Material' },
    { key: 'color', label: 'Color Options' },
    { key: 'size', label: 'Size Options' },
    { key: 'care', label: 'Care Instructions' },
    { key: 'features', label: 'Features' }
  ];

  const renderFieldValue = (item, field) => {
    switch (field.key) {
      case 'price':
        return (
          <div>
            <span className="text-lg font-bold text-[#9DC08B]">৳{parseFloat(item.price).toFixed(2)}</span>
            <span className="text-sm text-gray-500 line-through ml-2">৳{parseFloat(item.original_price).toFixed(2)}</span>
          </div>
        );
      case 'rating':
        return (
          <div className="flex items-center gap-2">
            <Rating value={item.rating} precision={0.5} readOnly size="small" />
            <span className="text-sm text-gray-600">({item.reviews})</span>
          </div>
        );
      case 'features':
        return (
          <ul className="list-disc list-inside text-sm space-y-1">
            {item.features && item.features.length > 0 ? (
              item.features.map((feature, index) => (
                <li key={index} className="text-[#40513B]">{feature}</li>
              ))
            ) : (
              <span className="text-gray-500">No features listed</span>
            )}
          </ul>
        );
      default:
        const value = item[field.key];
        return <span className="text-[#40513B]">{value || 'N/A'}</span>;
    }
  };

  return (
    <div className="bg-[#EDF6E5] min-h-screen py-8 font-montserrat">
      <div className="container mx-auto px-4">
        {/* Custom Alert */}
        <CustomAlert
          show={alert.show}
          severity={alert.severity}
          title={alert.title}
          message={alert.message}
          onClose={hideAlert}
          autoHideDuration={5000}
        />

        <div className="flex items-center gap-2 mb-8">
          <Link to="/" className="text-[#40513B] hover:text-[#9DC08B]">
            <FaArrowLeft />
          </Link>
          <h1 className="text-3xl font-bold text-[#40513B]">Compare Products</h1>
          <span className="text-[#9DC08B]">({compareItems.length}/{CompareService.MAX_COMPARE_ITEMS} items)</span>
          {compareItems.length > 0 && (
            <button
              onClick={() => {
                CompareService.clearCompareList();
                setCompareItems([]);
                showAlert('success', 'Cleared', 'Compare list cleared');
              }}
              className="ml-auto px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <div className="min-w-full">
            {/* Product Headers */}
            <div className={`grid gap-4 p-6 border-b border-gray-200 ${
              compareItems.length === 1 
                ? 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1 max-w-md mx-auto' 
                : compareItems.length === 2 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto' 
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {compareItems.map((item) => (
                <div key={item.id} className="text-center">
                  <div className="relative">
                    <div className="product-image-container">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-48 object-cover rounded-lg mb-4 product-image-zoom"
                      />
                    </div>
                    <IconButton
                      onClick={() => removeFromCompare(item.id)}
                      className="absolute top-2 right-2 bg-white text-red-500 hover:bg-red-50"
                      size="small"
                    >
                      <FaTrash />
                    </IconButton>
                    {!item.inStock && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        Out of Stock
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-[#40513B] mb-2">
                    <Link to={`/product/${item.id}`} className="hover:text-[#9DC08B]">
                      {item.name}
                    </Link>
                  </h3>
                  
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="text-lg font-bold text-[#9DC08B]">৳{parseFloat(item.price).toFixed(2)}</span>
                    <span className="text-sm text-gray-500 line-through">৳{parseFloat(item.original_price).toFixed(2)}</span>
                    {item.discount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {Math.round(item.discount * 100)}% OFF
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 mb-4">
                    <StyledButton
                      variant="contained"
                      size="small"
                      startIcon={<FaShoppingCart />}
                      onClick={() => addToCart(item)}
                      disabled={!item.inStock}
                      fullWidth
                    >
                      {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </StyledButton>
                  </div>

                  <IconButton
                    onClick={() => addToWishlist(item)}
                    className="text-[#40513B] hover:text-red-500"
                    size="small"
                  >
                    <FaHeart />
                  </IconButton>
                </div>
              ))}
            </div>

            {/* Comparison Table */}
            <div className="divide-y divide-gray-200">
              {comparisonFields.map((field, index) => (
                <div key={index} className={`grid gap-4 p-4 ${
                  compareItems.length === 1 
                    ? 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1 max-w-md mx-auto' 
                    : compareItems.length === 2 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto' 
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`}>
                  <div className="font-semibold text-[#40513B] flex items-center">
                    {field.label}
                  </div>
                  {compareItems.map((item) => (
                    <div key={item.id} className="text-center">
                      {renderFieldValue(item, field)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Smart Recommendations */}
        <Recommendations 
          type="smart"
          title="You Might Also Like"
          limit={4}
          className="mt-12"
        />
        
        {/* Cart-based Recommendations */}
        <Recommendations 
          type="cart-based"
          title="Based on Your Cart"
          limit={4}
          className="mt-8"
        />
        
        {/* Trending Recommendations */}
        <Recommendations 
          type="trending"
          title="Trending Now"
          limit={4}
          className="mt-8"
        />
      </div>
    </div>
  );
};

export default CompareProducts; 