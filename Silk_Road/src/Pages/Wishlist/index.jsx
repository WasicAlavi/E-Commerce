import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { FaHeart, FaTrash, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import ProductCard from '../../components/ProductCard';

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
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 1,
      name: 'Premium Cotton T-Shirt',
      price: 2500,
      originalPrice: 3500,
      image: '/product1.jpg',
      discount: 0.29,
      inStock: true
    },
    {
      id: 2,
      name: 'Denim Jeans',
      price: 3000,
      originalPrice: 4000,
      image: '/product2.jpg',
      discount: 0.25,
      inStock: true
    },
    {
      id: 3,
      name: 'Wireless Earbuds',
      price: 3500,
      originalPrice: 4500,
      image: '/product3.jpg',
      discount: 0.22,
      inStock: false
    }
  ]);

  const removeFromWishlist = (itemId) => {
    setWishlistItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const moveToCart = (item) => {
    console.log('Moving to cart:', item);
    removeFromWishlist(item.id);
  };

  const clearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      setWishlistItems([]);
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
            variant="outlined"
            onClick={clearWishlist}
            sx={{
              borderColor: '#ef4444',
              color: '#ef4444',
              '&:hover': {
                borderColor: '#dc2626',
                backgroundColor: '#fef2f2',
              }
            }}
          >
            Clear All
          </StyledButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                  <IconButton
                    onClick={() => removeFromWishlist(item.id)}
                    className="bg-white text-red-500 hover:bg-red-50"
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
                  <Link to={`/product/${item.id}`} className="hover:text-[#9DC08B]">
                    {item.name}
                  </Link>
                </h3>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold text-[#9DC08B]">৳{item.price}</span>
                  <span className="text-sm text-gray-500 line-through">৳{item.originalPrice}</span>
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {item.discount * 100}% OFF
                  </span>
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

        {/* Recommendations */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-[#40513B] mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <ProductCard
                key={item}
                product={{
                  id: item + 10,
                  name: `Recommended Product ${item}`,
                  price: 2000 + item * 500,
                  image: `/product${item}.jpg`,
                  discount: 0.2
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist; 