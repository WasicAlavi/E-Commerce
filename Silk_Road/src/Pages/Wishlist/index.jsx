import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { FaHeart, FaTrash, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import ProductCard from '../../components/ProductCard';
import Recommendations from '../../components/Recommendations';
import { useAuth } from '../../AuthContext';
import authService from '../../services/authService';
import { API_BASE_URL } from '../../config';


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

const Wishlist = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistId, setWishlistId] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchWishlistAndItems = async () => {
      const token = authService.getToken();
      if (!token) {
        console.error('No token found');
        return;
      }

      // 1. Get the user's wishlist
      const customerId = user.customer_id || user.id;
      const wishlistRes = await fetch(`${API_BASE_URL}/wishlists/customer/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!wishlistRes.ok) return;
      const wishlistData = await wishlistRes.json();
      const wishlist = wishlistData.data;
      setWishlistId(wishlist.id);

      // 2. Get the items for this wishlist
      const itemsRes = await fetch(`${API_BASE_URL}/wishlists/${wishlist.id}/items`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!itemsRes.ok) return;
      const items = await itemsRes.json();

      // 3. Fetch product details for each item
      const productPromises = items.map(item =>
        fetch(`${API_BASE_URL}/products/card/${item.product_id}`)
          .then(res => res.json())
          .then(product => ({
            ...item,
            name: product.name,
            image: product.image,
            price: product.price,
            originalPrice: product.price / (1 - (product.discount || 0)),
            discount: product.discount,
            inStock: product.stock > 0,
          }))
      );
      const itemsWithProduct = await Promise.all(productPromises);
      setWishlistItems(itemsWithProduct);
    };

    fetchWishlistAndItems();
  }, [user]);

  const removeFromWishlist = async (itemId) => {
    try {
      const token = authService.getToken();
      const res = await fetch(`${API_BASE_URL}/wishlists/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setWishlistItems(prevItems => prevItems.filter(item => item.id !== itemId));
        
        // Trigger badge count refresh
        if (window.refreshHeaderBadges) {
          window.refreshHeaderBadges();
        }
      } else {
        alert('Failed to remove item from wishlist');
      }
    } catch (err) {
      alert('Error removing item from wishlist');
    }
  };

  const moveToCart = async (item) => {
    // 1. Add to cart
    try {
      const token = authService.getToken();
      if (!token) {
        alert('Please log in to move items to cart');
        return;
      }

      // Get or create cart for user
      const customerId = user.customer_id || user.id;
      const cartRes = await fetch(`${API_BASE_URL}/carts/customer/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const cartData = await cartRes.json();
      const cart = cartData.data;
      // Add item to cart
      await fetch(`${API_BASE_URL}/carts/${cart.id}/items`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          cart_id: cart.id,
          product_id: item.product_id,
          quantity: 1,
        }),
      });
      // 2. Remove from wishlist
      await removeFromWishlist(item.id);
      
      // Immediately update cart count by dispatching events
      window.dispatchEvent(new Event('cartUpdated'));
      window.dispatchEvent(new Event('wishlistUpdated'));
      
      // Also trigger badge count refresh with a small delay to ensure backend is updated
      setTimeout(() => {
        if (window.refreshHeaderBadges) {
          window.refreshHeaderBadges();
        }
      }, 1000);
      
      // Show success message
      alert('Item moved to cart successfully!');
    } catch (err) {
      alert('Error moving item to cart');
    }
  };

  const clearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      try {
        const token = authService.getToken();
        if (!token) {
          alert('Please log in to clear wishlist');
          return;
        }

        // Get wishlist ID
        const customerId = user.customer_id || user.id;
        const wishlistRes = await fetch(`${API_BASE_URL}/wishlists/customer/${customerId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!wishlistRes.ok) {
          alert('Failed to get wishlist');
          return;
        }
        const wishlistData = await wishlistRes.json();
        const wishlist = wishlistData.data;

        // Clear wishlist
        const clearRes = await fetch(`${API_BASE_URL}/wishlists/${wishlist.id}/clear`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (clearRes.ok) {
          setWishlistItems([]);
          alert('Wishlist cleared successfully!');
          
          // Trigger badge count refresh
          if (window.refreshHeaderBadges) {
            window.refreshHeaderBadges();
          }
        } else {
          alert('Failed to clear wishlist');
        }
      } catch (err) {
        console.error('Error clearing wishlist:', err);
        alert('Error clearing wishlist');
      }
    }
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="bg-[#EDF6E5] min-h-screen py-12 font-montserrat">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <FaHeart size={80} className="mx-auto text-gray-300 mb-6" />
            <h2 className="text-3xl font-bold text-[#40513B] mb-4">Your Wishlist is Empty</h2>
            <p className="text-lg text-[#40513B] mb-8">
              Start adding items to your wishlist to see them here.
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

  return (
    <div className="bg-[#EDF6E5] min-h-screen py-8 font-montserrat">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Link to="/" className="text-[#40513B] hover:text-[#9DC08B]">
              <FaArrowLeft />
            </Link>
            <h1 className="text-3xl font-bold text-[#40513B]">My Wishlist</h1>
            <span className="text-[#9DC08B]">({wishlistItems.length} items)</span>
          </div>
          <StyledButton
            variant="contained"
            onClick={clearWishlist}
            sx={{
              backgroundColor: '#ef4444',
              color: '#fff',
              border: 'none',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#dc2626',
                color: '#fff',
                border: 'none',
                boxShadow: 'none',
              },
            }}
          >
            Clear All
          </StyledButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <div className="product-image-container">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover product-image-zoom"
                  />
                </div>
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                  <IconButton
                    onClick={() => removeFromWishlist(item.id)}
                    sx={{
                      backgroundColor: '#ef4444',
                      color: '#fff',
                      '&:hover': {
                        backgroundColor: '#dc2626',
                        color: '#fff',
                      },
                      boxShadow: 1,
                    }}
                    size="small"
                  >
                    <FaTrash />
                  </IconButton>
                </div>
                {!item.inStock && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    Out of Stock
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-[#40513B] mb-2">
                  <Link to={`/product/${item.product_id}`} className="hover:text-[#9DC08B]">
                    {item.name}
                  </Link>
                </h3>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold text-[#9DC08B]">৳{item.price.toFixed(2)}</span>
                  {item.discount > 0 && (
                    <>
                      <span className="text-sm text-gray-500 line-through">৳{isFinite(item.originalPrice) ? item.originalPrice.toFixed(2) : ''}</span>
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {Math.round(item.discount * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>

                <div className="flex gap-2">
                  <StyledButton
                    variant="contained"
                    fullWidth
                    startIcon={<FaShoppingCart />}
                    onClick={() => moveToCart(item)}
                    disabled={!item.inStock}
                  >
                    {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </StyledButton>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Smart Recommendations */}
        <Recommendations 
          type="wishlist-based"
          title="Based on Your Wishlist"
          limit={4}
          className="mt-12"
        />
        
        {/* For You Recommendations */}
        <Recommendations 
          type="for-you"
          title="Recommended for You"
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

export default Wishlist; 