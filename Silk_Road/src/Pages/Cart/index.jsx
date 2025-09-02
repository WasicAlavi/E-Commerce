import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import { FaTrash, FaHeart, FaArrowLeft } from 'react-icons/fa';
import { MdOutlineShoppingCart } from 'react-icons/md';
import { useAuth } from '../../AuthContext';
import wishlistService from '../../services/wishlistService';
import cartService from '../../services/cartService';
import authService from '../../services/authService';
import AddressSelector from '../../components/AddressSelector';
import CustomAlert from '../../components/Alert';
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
  console.log('Cart component rendered');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [cartId, setCartId] = useState(null);
  const [addressSelectorOpen, setAddressSelectorOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(user?.address_id || null);
  const [addresses, setAddresses] = useState([]);

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

  useEffect(() => {
    console.log('currentUser:', user);
    if (!user?.id) return;

    const fetchCartAndItems = async () => {
      const token = authService.getToken();
      if (!token) {
        console.error('No token found');
        return;
      }

      // 1. Get the user's cart using customer_id
      const customerId = user.customer_id || user.id;
      const cartRes = await fetch(`${API_BASE_URL}/carts/customer/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!cartRes.ok) return;
      const cartData = await cartRes.json();
      console.log('Cart fetch response:', cartData);
      const cart = cartData.data;
      setCartId(cart.id);

      // 2. Get the items for this cart
      const itemsRes = await fetch(`${API_BASE_URL}/carts/${cart.id}/items`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!itemsRes.ok) return;
      const items = await itemsRes.json();
      console.log('Cart items fetch response:', items);

      // 3. Fetch product details for each item
      const productPromises = items.map(item =>
        fetch(`${API_BASE_URL}/products/card/${item.product_id}`)
          .then(res => res.json())
          .then(product => ({
            ...item,
            name: product.name,
            image: product.image,
            price: product.price,
            originalPrice: product.price / (1 - (product.discount || 0)), // fallback for original price
            // add other product fields as needed
          }))
      );
      const itemsWithProduct = await Promise.all(productPromises);
      setCartItems(itemsWithProduct);
    };

    fetchCartAndItems();
  }, [user]);

  useEffect(() => {
    if (user && user.customer_id) {
      const token = authService.getToken();
      if (token) {
        fetch(`${API_BASE_URL}/addresses/customer/${user.customer_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
          .then(res => res.json())
          .then(data => setAddresses(data));
      }
    }
  }, [user]);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const token = authService.getToken();
      const res = await fetch(`${API_BASE_URL}/carts/items/${itemId}/quantity?quantity=${newQuantity}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.id === itemId
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
        
        // Trigger badge count refresh
        if (window.refreshHeaderBadges) {
          window.refreshHeaderBadges();
        }
      } else {
        showAlert('error', 'Error', 'Failed to update quantity');
      }
    } catch (err) {
      showAlert('error', 'Error', 'Error updating quantity');
    }
  };

  const removeItem = async (itemId) => {
    // Call backend to remove item
    try {
      const token = authService.getToken();
      const res = await fetch(`${API_BASE_URL}/carts/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
        
        // Trigger badge count refresh
        if (window.refreshHeaderBadges) {
          window.refreshHeaderBadges();
        }
      } else {
        showAlert('error', 'Error', 'Failed to remove item from cart');
      }
    } catch (err) {
      showAlert('error', 'Error', 'Error removing item from cart');
    }
  };

  const moveToWishlist = async (item) => {
    console.log('Adding to wishlist:', item);
    try {
      // Check if user is logged in
      if (!user?.id) {
        showAlert('warning', 'Login Required', 'Please log in to use wishlist');
        return;
      }

      // 1. Ensure wishlist exists
      const wishlist = await wishlistService.getOrCreateWishlist();
      
      // 2. Add product to wishlist using the service
      await wishlistService.addItemToWishlist(wishlist.id, item.product_id);
      
      showAlert('success', 'Success', 'Added to wishlist!');
      
      // Trigger badge count refresh
      if (window.refreshHeaderBadges) {
        window.refreshHeaderBadges();
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      showAlert('error', 'Error', 'Error adding to wishlist');
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      showAlert('warning', 'Empty Code', 'Please enter a coupon code');
      return;
    }

    if (!user?.customer_id) {
      showAlert('error', 'Login Required', 'Please log in to apply coupons');
      return;
    }

    try {
      const response = await fetch('${API_BASE_URL}/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          order_total: calculateSubtotal(),
          customer_id: user.customer_id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to validate coupon');
      }

      if (data.data && data.data.valid) {
        setAppliedCoupon({
          code: couponCode.trim().toUpperCase(),
          discount: data.data.discount_value,
          type: data.data.discount_type,
          discountAmount: data.data.discount_amount,
          finalAmount: data.data.final_amount
        });
        showAlert('success', 'Coupon Applied', data.data.message);
      } else {
        showAlert('error', 'Invalid Coupon', data.data?.message || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      showAlert('error', 'Error', error.message || 'Failed to apply coupon');
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
    
    // Use the discount amount calculated by the backend
    if (appliedCoupon.discountAmount !== undefined) {
      return appliedCoupon.discountAmount;
    }
    
    // Fallback calculation if discountAmount is not available
    const subtotal = calculateSubtotal();
    if (appliedCoupon.type === 'percentage') {
      return subtotal * (appliedCoupon.discount / 100);
    } else {
      return Math.min(appliedCoupon.discount, subtotal);
    }
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 3000 ? 0 : 100; //
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const shipping = calculateShipping();
    return subtotal - discount + shipping;
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      showAlert('warning', 'Empty Cart', 'Your cart is empty');
      return;
    }

    // Check if user has any addresses
    if (!addresses || addresses.length === 0) {
      const shouldGoToProfile = window.confirm('You need to add a shipping address before placing an order. Would you like to go to your Profile page to add an address?');
      if (shouldGoToProfile) {
        navigate('/profile');
      }
      return;
    }

    // If user has addresses but none selected, open address selector
    if (!selectedAddressId) {
      setAddressSelectorOpen(true);
      return;
    }

    // Proceed with checkout
    await placeOrder();
  };

  const placeOrder = async () => {
    console.log('Proceeding to checkout');
    setCheckoutLoading(true);
    try {
      if (!selectedAddressId || selectedAddressId === "null") {
        showAlert('error', 'No Address', 'Please select a valid address before placing an order.');
        return;
      }

      const orderData = {
        customer_id: user.customer_id,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          originalPrice: item.originalPrice,
          discount: item.discount,
          name: item.name,
          image: item.image,
          size: item.size,
          color: item.color,
        })),
        subtotal: calculateSubtotal(),
        discount: calculateDiscount(),
        shipping: calculateShipping(),
        total: calculateTotal(),
        coupon: appliedCoupon,
      };

      console.log('Order data:', orderData);
      console.log('Current user:', user);
      console.log('Selected address ID:', selectedAddressId);
      console.log('Using address ID for API call:', selectedAddressId);

      const result = await cartService.placeOrder(orderData, selectedAddressId);
      
      if (result.success && result.redirect) {
        // Payment gateway will handle the redirect
        // Cart will be cleared after successful payment
        showAlert('info', 'Redirecting to Payment', 'Redirecting to payment gateway...');
      } else if (result.success) {
        // Direct order placement (fallback)
        setCartItems([]);
        setAppliedCoupon(null);
        showAlert('success', 'Order Placed', 'Order placed successfully!');
        navigate('/order-confirmation', { state: { orderId: result.orderId } });
      } else {
        showAlert('error', 'Order Failed', result.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      showAlert('error', 'Error', 'Error placing order. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleAddressSelect = (addressId) => {
    if (!addressId || addressId === "null") {
      window.alert("Please select a valid address!");
      return;
    }
    console.log('Selected address ID:', addressId);
    setSelectedAddressId(Number(addressId));
    setAddressSelectorOpen(false);
  };

  const handleAddNewAddress = () => {
    navigate('/profile');
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
        {/* Custom Alert */}
        <CustomAlert
          show={alert.show}
          severity={alert.severity}
          title={alert.title}
          message={alert.message}
          onClose={hideAlert}
          autoHideDuration={5000}
        />
        
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
                  <div className="product-image-container w-24 h-24">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-md product-image-zoom"
                    />
                  </div>
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
                          <span className="text-lg font-bold text-[#9DC08B]">৳{item.price.toFixed(2)}</span>
                          <span className="text-sm text-gray-500 line-through">
                            ৳{isFinite(item.originalPrice) ? item.originalPrice.toFixed(2) : ''}
                          </span>
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
                          ৳{(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          ৳{isFinite(item.originalPrice) ? (item.originalPrice * item.quantity).toFixed(2) : ''}
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
              
              {/* Delivery Address */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#40513B] mb-3">Delivery Address</h3>
                {selectedAddressId && addresses ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                    {(() => {
                      const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
                      return selectedAddress ? (
                        <div>
                          <div className="font-medium text-[#40513B]">{selectedAddress.street}</div>
                          <div className="text-sm text-gray-600">
                            {selectedAddress.city}, {selectedAddress.division}
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedAddress.country} - {selectedAddress.postal_code}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500">No address selected</div>
                      );
                    })()}
                    <button
                      onClick={() => setAddressSelectorOpen(true)}
                      className="text-[#9DC08B] hover:text-[#40513B] text-sm mt-2"
                    >
                      Change Address
                    </button>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="text-yellow-700 text-sm mb-2">No delivery address selected</div>
                    <button
                      onClick={() => setAddressSelectorOpen(true)}
                      className="text-[#9DC08B] hover:text-[#40513B] text-sm"
                    >
                      Select Address
                    </button>
                  </div>
                )}
              </div>
              
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
                        ? `${appliedCoupon.discount}% off`
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
                  <span className="text-[#40513B]">৳{calculateSubtotal().toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-৳{calculateDiscount().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#40513B]">Shipping</span>
                  <span className="text-[#40513B]">
                    {calculateShipping() === 0 ? 'Free' : `৳${calculateShipping().toFixed(2)}`}
                  </span>
                </div>
                <hr className="border-[#9DC08B]" />
                <div className="flex justify-between text-lg font-bold text-[#40513B]">
                  <span>Total</span>
                  <span>৳{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <StyledButton
                variant="contained"
                fullWidth
                onClick={handleCheckout}
                sx={{ mb: 3 }}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? 'Placing Order...' : 'Proceed to Checkout'}
              </StyledButton>

              {/* Continue Shopping */}
              <Link to="/">
                <StyledButton
                  variant="outlined"
                  fullWidth
                  sx={{
                    borderColor: '#9DC08B',
                    color: '#40513B',
                    backgroundColor: 'white',
                    '&:hover': {
                      borderColor: '#40513B',
                      backgroundColor: '#9DC08B',
                      color: 'white',
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

      {/* Address Selector Modal */}
      <AddressSelector
        open={addressSelectorOpen}
        onClose={() => setAddressSelectorOpen(false)}
        addresses={addresses}
        selectedAddressId={selectedAddressId}
        onAddressSelect={handleAddressSelect}
        onAddNewAddress={handleAddNewAddress}
      />
    </div>
  );
};

export default Cart; 