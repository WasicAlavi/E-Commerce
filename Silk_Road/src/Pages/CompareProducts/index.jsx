import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Rating from '@mui/material/Rating';
import { FaTrash, FaShoppingCart, FaHeart, FaArrowLeft } from 'react-icons/fa';

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
  const [compareItems, setCompareItems] = useState([
    {
      id: 1,
      name: 'Premium Cotton T-Shirt',
      price: 2500,
      originalPrice: 3500,
      image: '/product1.jpg',
      discount: 0.29,
      rating: 4.5,
      reviews: 128,
      brand: 'Silk Road',
      material: '100% Cotton',
      color: 'Black, White, Navy',
      size: 'S, M, L, XL, XXL',
      care: 'Machine wash cold',
      inStock: true,
      features: [
        'Comfortable fit',
        'Breathable fabric',
        'Modern design',
        'Machine washable'
      ]
    },
    {
      id: 2,
      name: 'Denim Jeans',
      price: 3000,
      originalPrice: 4000,
      image: '/product2.jpg',
      discount: 0.25,
      rating: 4.2,
      reviews: 95,
      brand: 'Silk Road',
      material: '98% Cotton, 2% Elastane',
      color: 'Blue, Black, Gray',
      size: '28, 30, 32, 34, 36',
      care: 'Machine wash cold',
      inStock: true,
      features: [
        'Stretch denim',
        'Comfortable fit',
        'Classic design',
        'Durable material'
      ]
    },
    {
      id: 3,
      name: 'Wireless Earbuds',
      price: 3500,
      originalPrice: 4500,
      image: '/product3.jpg',
      discount: 0.22,
      rating: 4.7,
      reviews: 203,
      brand: 'TechPro',
      material: 'Plastic, Metal',
      color: 'White, Black, Blue',
      size: 'One Size',
      care: 'Clean with soft cloth',
      inStock: false,
      features: [
        'Bluetooth 5.0',
        'Noise cancellation',
        '20-hour battery',
        'Water resistant'
      ]
    }
  ]);

  const removeFromCompare = (itemId) => {
    setCompareItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const addToCart = (item) => {
    console.log('Added to cart:', item);
  };

  const addToWishlist = (item) => {
    console.log('Added to wishlist:', item);
  };

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
            <span className="text-lg font-bold text-[#9DC08B]">৳{item.price}</span>
            <span className="text-sm text-gray-500 line-through ml-2">৳{item.originalPrice}</span>
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
            {item.features.map((feature, index) => (
              <li key={index} className="text-[#40513B]">{feature}</li>
            ))}
          </ul>
        );
      default:
        return <span className="text-[#40513B]">{item[field.key]}</span>;
    }
  };

  return (
    <div className="bg-[#EDF6E5] min-h-screen py-8 font-montserrat">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-8">
          <Link to="/" className="text-[#40513B] hover:text-[#9DC08B]">
            <FaArrowLeft />
          </Link>
          <h1 className="text-3xl font-bold text-[#40513B]">Compare Products</h1>
          <span className="text-[#9DC08B]">({compareItems.length} items)</span>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <div className="min-w-full">
            {/* Product Headers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 border-b border-gray-200">
              {compareItems.map((item) => (
                <div key={item.id} className="text-center">
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
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
                    <span className="text-lg font-bold text-[#9DC08B]">৳{item.price}</span>
                    <span className="text-sm text-gray-500 line-through">৳{item.originalPrice}</span>
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      {item.discount * 100}% OFF
                    </span>
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
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
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

        {/* Recommendations */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-[#40513B] mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-md p-4 text-center">
                <img
                  src={`/product${item}.jpg`}
                  alt={`Product ${item}`}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
                <h3 className="font-semibold text-[#40513B] mb-2">
                  Similar Product {item}
                </h3>
                <p className="text-[#9DC08B] font-bold mb-3">৳{2000 + item * 500}</p>
                <StyledButton
                  variant="outlined"
                  size="small"
                  fullWidth
                >
                  Add to Compare
                </StyledButton>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareProducts; 