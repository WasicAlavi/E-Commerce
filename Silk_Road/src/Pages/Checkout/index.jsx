import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Checkbox from '@mui/material/Checkbox';
import { FaArrowLeft, FaCreditCard, FaPaypal, FaMobile, FaWallet } from 'react-icons/fa';
import { useAuth } from '../../AuthContext';
import cartService from '../../services/cartService';
import AddressSelector from '../../components/AddressSelector';
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

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [addressSelectorOpen, setAddressSelectorOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

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
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Bangladesh'
  });
  const [billingInfo, setBillingInfo] = useState({
    sameAsShipping: true,
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });
  const [termsAccepted, setTermsAccepted] = useState(false);



  // Mock cart data for demonstration
  const cartItems = [
    {
      id: 1,
      name: 'Premium Cotton T-Shirt',
      price: 2500,
      quantity: 2,
      image: '/product1.jpg'
    },
    {
      id: 2,
      name: 'Denim Jeans',
      price: 3000,
      quantity: 1,
      image: '/product2.jpg'
    }
  ];

  // Fetch addresses on component mount
  useEffect(() => {
    if (user?.customer_id) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/addresses/customer/${user.customer_id}`);
      const data = await response.json();
      if (data.success) {
        setAddresses(data.data);
        // Set default address if available
        if (data.data.length > 0) {
          setSelectedAddressId(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleAddressSelect = (addressId) => {
    if (!addressId || addressId === "null") {
      showAlert('error', 'Invalid Address', 'Please select a valid address!');
      return;
    }
    setSelectedAddressId(Number(addressId));
    setAddressSelectorOpen(false);
  };

  const handleAddNewAddress = () => {
    navigate('/profile');
  };

  // Calculate totals based on cart items
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal >= 3000 ? 0 : 200;
  const total = subtotal + shipping;

  const steps = ['Shipping Information', 'Payment Method', 'Order Review'];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handlePlaceOrder();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handlePlaceOrder = async () => {
    if (!termsAccepted) {
      showAlert('warning', 'Terms Required', 'Please accept the terms and conditions');
      return;
    }

    if (!selectedAddressId) {
      showAlert('warning', 'Address Required', 'Please select a shipping address');
      setAddressSelectorOpen(true);
      return;
    }

    setCheckoutLoading(true);
    try {
      // Prepare order data
      const orderData = {
        customer_id: user.customer_id,
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          originalPrice: item.price,
          discount: 0,
          name: item.name,
          image: item.image,
          size: item.selectedSize,
          color: item.selectedColor,
        })),
        subtotal: subtotal,
        discount: 0,
        shipping: shipping,
        total: total,
        coupon: null,
      };

      console.log('Order data:', orderData);
      console.log('Using address ID:', selectedAddressId);

      // Use cartService to place order
      const result = await cartService.placeOrder(orderData, selectedAddressId);
      
      if (result.success && result.redirect) {
        // Payment gateway will handle the redirect
        showAlert('info', 'Redirecting to Payment', 'Redirecting to payment gateway...');
      } else if (result.success) {
        // Direct order placement (fallback)
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

  const renderShippingForm = () => (
    <div className="space-y-6">
      {/* Address Selection */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-[#40513B] mb-4">Shipping Address</h3>
        
        {addresses.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">No shipping addresses found.</p>
            <StyledButton
              variant="contained"
              onClick={handleAddNewAddress}
              sx={{ backgroundColor: '#9DC08B', color: '#fff' }}
            >
              Add New Address
            </StyledButton>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedAddressId === address.id
                    ? 'border-[#9DC08B] bg-[#F6FFF2]'
                    : 'border-gray-200 hover:border-[#9DC08B]'
                }`}
                onClick={() => setSelectedAddressId(address.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-[#40513B]">
                      {address.full_name}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {address.address_line1}
                      {address.address_line2 && `, ${address.address_line2}`}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {address.city}, {address.state} {address.postal_code}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Phone: {address.phone}
                    </p>
                  </div>
                  <div className="ml-4">
                    {selectedAddressId === address.id && (
                      <div className="w-5 h-5 bg-[#9DC08B] rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="pt-2">
              <StyledButton
                variant="outlined"
                onClick={handleAddNewAddress}
                sx={{ 
                  borderColor: '#9DC08B', 
                  color: '#40513B',
                  '&:hover': {
                    borderColor: '#40513B',
                    backgroundColor: '#9DC08B',
                    color: 'white',
                  }
                }}
              >
                Add New Address
              </StyledButton>
            </div>
          </div>
        )}
      </div>

      {/* Manual Shipping Form (Optional) */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-[#40513B] mb-4">Additional Shipping Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StyledTextField
          fullWidth
          label="First Name"
          value={shippingInfo.firstName}
          onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
        />
        <StyledTextField
          fullWidth
          label="Last Name"
          value={shippingInfo.lastName}
          onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StyledTextField
          fullWidth
          label="Email"
          type="email"
          value={shippingInfo.email}
          onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
          required
        />
        <StyledTextField
          fullWidth
          label="Phone"
          value={shippingInfo.phone}
          onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
          required
        />
      </div>

      <StyledTextField
        fullWidth
        label="Address"
        multiline
        rows={3}
        value={shippingInfo.address}
        onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StyledTextField
          fullWidth
          label="City"
          value={shippingInfo.city}
          onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
          required
        />
        <StyledTextField
          fullWidth
          label="Postal Code"
          value={shippingInfo.postalCode}
          onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
          required
        />
        <StyledTextField
          fullWidth
          label="Country"
          value={shippingInfo.country}
          onChange={(e) => setShippingInfo({...shippingInfo, country: e.target.value})}
          required
        />
      </div>
    </div>
    </div>
  );

  const renderBillingForm = () => (
    <div className="space-y-6">
      <FormControlLabel
        control={
          <Checkbox
            checked={billingInfo.sameAsShipping}
            onChange={(e) => setBillingInfo({...billingInfo, sameAsShipping: e.target.checked})}
            sx={{
              color: '#9DC08B',
              '&.Mui-checked': {
                color: '#9DC08B',
              },
            }}
          />
        }
        label="Same as shipping address"
        className="text-[#40513B]"
      />

      {!billingInfo.sameAsShipping && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StyledTextField
              fullWidth
              label="First Name"
              value={billingInfo.firstName}
              onChange={(e) => setBillingInfo({...billingInfo, firstName: e.target.value})}
            />
            <StyledTextField
              fullWidth
              label="Last Name"
              value={billingInfo.lastName}
              onChange={(e) => setBillingInfo({...billingInfo, lastName: e.target.value})}
            />
          </div>

          <StyledTextField
            fullWidth
            label="Address"
            multiline
            rows={3}
            value={billingInfo.address}
            onChange={(e) => setBillingInfo({...billingInfo, address: e.target.value})}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StyledTextField
              fullWidth
              label="City"
              value={billingInfo.city}
              onChange={(e) => setBillingInfo({...billingInfo, city: e.target.value})}
            />
            <StyledTextField
              fullWidth
              label="Postal Code"
              value={billingInfo.postalCode}
              onChange={(e) => setBillingInfo({...billingInfo, postalCode: e.target.value})}
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderPaymentForm = () => (
    <div className="space-y-6">
      <FormControl component="fieldset">
        <FormLabel component="legend" className="text-[#40513B] font-semibold mb-4">
          Payment Method
        </FormLabel>
        <RadioGroup
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <FormControlLabel
            value="card"
            control={<Radio sx={{ color: '#9DC08B', '&.Mui-checked': { color: '#9DC08B' } }} />}
            label={
              <div className="flex items-center gap-2">
                <FaCreditCard className="text-[#40513B]" />
                <span className="text-[#40513B]">Credit/Debit Card</span>
              </div>
            }
          />
          <FormControlLabel
            value="paypal"
            control={<Radio sx={{ color: '#9DC08B', '&.Mui-checked': { color: '#9DC08B' } }} />}
            label={
              <div className="flex items-center gap-2">
                <FaPaypal className="text-[#40513B]" />
                <span className="text-[#40513B]">PayPal</span>
              </div>
            }
          />
          <FormControlLabel
            value="bkash"
            control={<Radio sx={{ color: '#9DC08B', '&.Mui-checked': { color: '#9DC08B' } }} />}
            label={
              <div className="flex items-center gap-2">
                <FaMobile className="text-[#40513B]" />
                <span className="text-[#40513B]">bKash</span>
              </div>
            }
          />
          <FormControlLabel
            value="nogod"
            control={<Radio sx={{ color: '#9DC08B', '&.Mui-checked': { color: '#9DC08B' } }} />}
            label={
              <div className="flex items-center gap-2">
                <FaWallet className="text-[#40513B]" />
                <span className="text-[#40513B]">Nagad</span>
              </div>
            }
          />
        </RadioGroup>
      </FormControl>

      {paymentMethod === 'card' && (
        <div className="space-y-4">
          <StyledTextField
            fullWidth
            label="Card Number"
            value={cardInfo.cardNumber}
            onChange={(e) => setCardInfo({...cardInfo, cardNumber: e.target.value})}
            placeholder="1234 5678 9012 3456"
          />
          <StyledTextField
            fullWidth
            label="Cardholder Name"
            value={cardInfo.cardName}
            onChange={(e) => setCardInfo({...cardInfo, cardName: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <StyledTextField
              fullWidth
              label="Expiry Date"
              value={cardInfo.expiry}
              onChange={(e) => setCardInfo({...cardInfo, expiry: e.target.value})}
              placeholder="MM/YY"
            />
            <StyledTextField
              fullWidth
              label="CVV"
              value={cardInfo.cvv}
              onChange={(e) => setCardInfo({...cardInfo, cvv: e.target.value})}
              placeholder="123"
            />
          </div>
        </div>
      )}

      {paymentMethod === 'bkash' && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-[#40513B] mb-2">Send money to: <strong>01XXXXXXXXX</strong></p>
          <p className="text-sm text-[#40513B]">Please include your order number in the reference.</p>
        </div>
      )}

      {paymentMethod === 'nogod' && (
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-[#40513B] mb-2">Send money to: <strong>01XXXXXXXXX</strong></p>
          <p className="text-sm text-[#40513B]">Please include your order number in the reference.</p>
        </div>
      )}
    </div>
  );

  const renderOrderReview = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#40513B] mb-4">Order Items</h3>
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="product-image-container w-16 h-16">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-md product-image-zoom"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-[#40513B]">{item.name}</h4>
                <p className="text-sm text-[#40513B]">Quantity: {item.quantity}</p>
                {item.selectedSize && (
                  <p className="text-sm text-[#40513B]">Size: {item.selectedSize}</p>
                )}
                {item.selectedColor && (
                  <p className="text-sm text-[#40513B]">Color: {item.selectedColor}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#40513B]">৳{item.price * item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#40513B] mb-4">Shipping Information</h3>
        <div className="text-[#40513B]">
          <p>{shippingInfo.firstName} {shippingInfo.lastName}</p>
          <p>{shippingInfo.address}</p>
          <p>{shippingInfo.city}, {shippingInfo.postalCode}</p>
          <p>{shippingInfo.country}</p>
          <p>Phone: {shippingInfo.phone}</p>
          <p>Email: {shippingInfo.email}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#40513B] mb-4">Payment Method</h3>
        <div className="flex items-center gap-2 text-[#40513B]">
          {paymentMethod === 'card' && <FaCreditCard />}
          {paymentMethod === 'paypal' && <FaPaypal />}
          {paymentMethod === 'bkash' && <FaMobile />}
          {paymentMethod === 'nogod' && <FaWallet />}
          <span className="capitalize">{paymentMethod}</span>
        </div>
      </div>

      <FormControlLabel
        control={
          <Checkbox
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            sx={{
              color: '#9DC08B',
              '&.Mui-checked': {
                color: '#9DC08B',
              },
            }}
          />
        }
        label={
          <span className="text-[#40513B]">
            I agree to the <Link to="/terms" className="text-[#9DC08B] hover:underline">Terms and Conditions</Link> and{' '}
            <Link to="/privacy" className="text-[#9DC08B] hover:underline">Privacy Policy</Link>
          </span>
        }
      />
    </div>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderShippingForm();
      case 1:
        return renderPaymentForm();
      case 2:
        return renderOrderReview();
      default:
        return null;
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

        <div className="flex items-center gap-2 mb-6">
          <Link to="/cart" className="text-[#40513B] hover:text-[#9DC08B]">
            <FaArrowLeft />
          </Link>
          <h1 className="text-3xl font-bold text-[#40513B]">
            Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 shadow-md">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index <= activeStep
                        ? 'bg-[#9DC08B] text-white'
                        : 'bg-gray-200 text-[#40513B]'
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      index <= activeStep ? 'text-[#9DC08B]' : 'text-[#40513B]'
                    }`}>
                      {step}
                    </span>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-0.5 mx-4 ${
                        index < activeStep ? 'bg-[#9DC08B]' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step Content */}
              <div className="mb-8">
                {renderStepContent()}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <StyledButton
                  variant="outlined"
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  sx={{
                    borderColor: '#9DC08B',
                    color: '#9DC08B',
                    '&:hover': {
                      borderColor: '#40513B',
                      color: '#40513B',
                    },
                    '&.Mui-disabled': {
                      borderColor: '#ccc',
                      color: '#ccc',
                    }
                  }}
                >
                  Back
                </StyledButton>
                <StyledButton
                  variant="contained"
                  onClick={handleNext}
                  disabled={checkoutLoading}
                >
                  {activeStep === steps.length - 1 
                    ? (checkoutLoading ? 'Processing...' : 'Place Order') 
                    : 'Next'
                  }
                </StyledButton>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-md sticky top-4">
              <h2 className="text-xl font-bold text-[#40513B] mb-6">Order Summary</h2>
              
              {/* Product Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="product-image-container w-16 h-16">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover rounded product-image-zoom"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-[#40513B]">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                        {item.selectedSize && ` | Size: ${item.selectedSize}`}
                        {item.selectedColor && ` | Color: ${item.selectedColor}`}
                      </p>
                      <p className="text-sm font-medium text-[#9DC08B]">
                        ৳{item.price} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-[#40513B]">Subtotal</span>
                  <span className="text-[#40513B]">৳{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#40513B]">Shipping</span>
                  <span className="text-[#40513B]">
                    {shipping === 0 ? 'Free' : `৳${shipping}`}
                  </span>
                </div>
                <hr className="border-[#9DC08B]" />
                <div className="flex justify-between text-lg font-bold text-[#40513B]">
                  <span>Total</span>
                  <span>৳{total}</span>
                </div>
              </div>

              <div className="text-sm text-[#40513B]">
                <p>• Free shipping on orders over ৳3000</p>
                <p>• Secure payment processing</p>
                <p>• 30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 