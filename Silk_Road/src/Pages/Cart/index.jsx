import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import { FaTrash, FaHeart, FaArrowLeft } from 'react-icons/fa';
import { MdOutlineShoppingCart } from 'react-icons/md';

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

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    fontFamily: 'Montserrat, sans-serif',
    color: '#40513B',
  },
  '& .MuiInputLabel-root': {
    fontFamily: 'Montserrat, sans-serif',
    color: '#40513B',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#9DC08B',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#9DC08B',
    },
    '&:hover fieldset': {
      borderColor: '#40513B',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#9DC08B',
    },
  },
}));

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Load cart items from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    setCartItems(storedCart ? JSON.parse(storedCart) : []);
  }, []);

  // Persist cart changes to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.min(newQuantity, item.stock) }
          : item
      )
    );
  };

  const removeItem = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const moveToWishlist = (item) => {
    console.log('Moving to wishlist:', item);
    removeItem(item.id);
  };

  const applyCoupon = () => {
    if (couponCode.trim()) {
      // Mock coupon validation
      const validCoupons = {
        'SAVE10': { discount: 0.1, type: 'percentage' },
        'SAVE500': { discount: 500, type: 'fixed' }
      };
      
      const coupon = validCoupons[couponCode.toUpperCase()];
      if (coupon) {
        setAppliedCoupon({ code: couponCode.toUpperCase(), ...coupon });
        alert('Coupon applied successfully!');
      } else {
        alert('Invalid coupon code');
      }
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    const subtotal = calculateSubtotal();
    if (appliedCoupon.type === 'percentage') {
      return subtotal * appliedCoupon.discount;
    } else {
      return Math.min(appliedCoupon.discount, subtotal);
    }
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 3000 ? 0 : 200; // Free shipping over ৳3000
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const shipping = calculateShipping();
    return subtotal - discount + shipping;
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    console.log('Proceeding to checkout');
    // Navigate to checkout page
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-[#EDF6E5] min-h-screen py-12 font-montserrat">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <MdOutlineShoppingCart size={80} className="mx-auto text-[#9DC08B] mb-6" />
            <h2 className="text-3xl font-bold text-[#40513B] mb-4">Your Cart is Empty</h2>
            <p className="text-lg text-[#40513B] mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link to="/">
              <StyledButton variant="contained" startIcon={<FaArrowLeft />}>
                Continue Shopping
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
        <div className="flex items-center gap-2 mb-6">
          <Link to="/" className="text-[#40513B] hover:text-[#9DC08B]">
            <FaArrowLeft />
          </Link>
          <h1 className="text-3xl font-bold text-[#40513B]">Shopping Cart</h1>
          <span className="text-[#9DC08B]">({cartItems.length} items)</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-[#40513B] mb-2">
                          <Link to={`/product/${item.productId}`} className="hover:text-[#9DC08B]">
                            {item.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-[#40513B] mb-1">
                          Size: {item.size} | Color: {item.color}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-[#9DC08B]">৳{item.price}</span>
                          <span className="text-sm text-gray-500 line-through">৳{item.originalPrice}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <IconButton
                          onClick={() => moveToWishlist(item)}
                          className="text-[#40513B] hover:text-red-500"
                        >
                          <FaHeart />
                        </IconButton>
                        <IconButton
                          onClick={() => removeItem(item.id)}
                          className="text-[#40513B] hover:text-red-500"
                        >
                          <FaTrash />
                        </IconButton>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[#40513B] font-medium">Quantity:</span>
                        <div className="flex items-center border border-[#9DC08B] rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 text-[#40513B] hover:bg-[#9DC08B] hover:text-white transition-colors"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-[#40513B] font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 text-[#40513B] hover:bg-[#9DC08B] hover:text-white transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#40513B]">
                          ৳{item.price * item.quantity}
                        </p>
                        <p className="text-sm text-gray-500">
                          ৳{item.originalPrice * item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-md sticky top-4">
              <h2 className="text-xl font-bold text-[#40513B] mb-6">Order Summary</h2>
              
              {/* Coupon Code */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#40513B] mb-3">Coupon Code</h3>
                {appliedCoupon ? (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 font-medium">{appliedCoupon.code}</span>
                      <button
                        onClick={removeCoupon}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-sm text-green-600">
                      {appliedCoupon.type === 'percentage' 
                        ? `${appliedCoupon.discount * 100}% off`
                        : `৳${appliedCoupon.discount} off`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <StyledTextField
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <StyledButton
                      variant="contained"
                      onClick={applyCoupon}
                      disabled={!couponCode.trim()}
                    >
                      Apply
                    </StyledButton>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-[#40513B]">Subtotal</span>
                  <span className="text-[#40513B]">৳{calculateSubtotal()}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-৳{calculateDiscount()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#40513B]">Shipping</span>
                  <span className="text-[#40513B]">
                    {calculateShipping() === 0 ? 'Free' : `৳${calculateShipping()}`}
                  </span>
                </div>
                <hr className="border-[#9DC08B]" />
                <div className="flex justify-between text-lg font-bold text-[#40513B]">
                  <span>Total</span>
                  <span>৳{calculateTotal()}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <StyledButton
                variant="contained"
                fullWidth
                onClick={handleCheckout}
                sx={{ mb: 3 }}
              >
                Proceed to Checkout
              </StyledButton>

              {/* Continue Shopping */}
              <Link to="/">
                <StyledButton
                  variant="outlined"
                  fullWidth
                  sx={{
                    borderColor: '#9DC08B',
                    color: '#9DC08B',
                    '&:hover': {
                      borderColor: '#40513B',
                      color: '#40513B',
                    }
                  }}
                >
                  Continue Shopping
                </StyledButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 