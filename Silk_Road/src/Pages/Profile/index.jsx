import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { FaUser, FaShoppingBag, FaHeart, FaCog, FaSignOutAlt, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { MdLocationOn, MdPayment } from 'react-icons/md';
import { LocalShipping as LocalShippingIcon } from '@mui/icons-material';
import { useAuth } from '../../AuthContext';
import CustomAlert from '../../components/Alert';
import RiderRegistration from '../../components/RiderRegistration';
import { useNavigate } from 'react-router-dom';
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

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRiderRegistration, setShowRiderRegistration] = useState(false);
  
  // Alert state management
  const [alert, setAlert] = useState({
    show: false,
    severity: 'info',
    title: '',
    message: ''
  });
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: ''
  });
  
  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    division: '',
    country: '',
    postalCode: ''
  });

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

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
    if (user && user.customer_id) {
      fetchProfileData();
      fetchAddresses();
      fetchOrders();
    }
  }, [user]);

  // Debug useEffect to log profileData changes
  useEffect(() => {
    console.log('profileData changed:', profileData);
  }, [profileData]);

  const fetchProfileData = async () => {
    try {
      console.log('Fetching profile for:', user?.customer_id);
      const response = await fetch(`${API_BASE_URL}/customers/profile/${user.customer_id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Profile data received:', data);
        setProfileData({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          dateOfBirth: data.date_of_birth || '',
          gender: data.gender || ''
        });
      } else {
        const errorText = await response.text();
        console.error('Profile fetch failed:', errorText);
        setError('Failed to fetch profile data');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Error fetching profile data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      console.log('Fetching addresses for customer:', user.customer_id);
      const addressResponse = await fetch(`${API_BASE_URL}/addresses/customer/${user.customer_id}`);
      if (addressResponse.ok) {
        const addressData = await addressResponse.json();
        console.log('Addresses received:', addressData);
        setAddresses(addressData);
      } else {
        const errorText = await addressResponse.text();
        console.error('Address fetch failed:', errorText);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/customers/orders/${user.customer_id}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
      } else {
        console.error('Failed to fetch orders');
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleProfileUpdate = async () => {
    try {
      console.log('Current profileData:', profileData); // Debug log
      console.log('dateOfBirth value:', profileData.dateOfBirth); // Debug log
      
      // Handle date formatting
      let dateOfBirth = null;
      if (profileData.dateOfBirth && profileData.dateOfBirth.trim() !== '') {
        dateOfBirth = profileData.dateOfBirth;
      }
      
      console.log('Processed dateOfBirth:', dateOfBirth); // Debug log
      
      const updateData = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
        date_of_birth: dateOfBirth,
        gender: profileData.gender || null
      };
      
      console.log('Sending profile update:', updateData); // Debug log
      
      const response = await fetch(`${API_BASE_URL}/customers/profile/${user.customer_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        showAlert('success', 'Profile Updated', 'Profile updated successfully!');
        await fetchProfileData();
      } else {
        const errorData = await response.json();
        console.error('Profile update error:', errorData); // Debug log
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      showAlert('error', 'Error', 'Error updating profile: ' + err.message);
    }
  };

  const handleAddressUpdate = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/addresses/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: user.customer_id,
          street: newAddress.street,
          city: newAddress.city,
          division: newAddress.division,
          country: newAddress.country,
          postal_code: newAddress.postalCode
        })
      });

      if (response.ok) {
        showAlert('success', 'Address Added', 'Address added successfully!');
        setNewAddress({
          street: '',
          city: '',
          division: '',
          country: '',
          postalCode: ''
        });
        await fetchAddresses();
      } else {
        const errorText = await response.text();
        console.error('Failed to add address:', errorText);
        showAlert('error', 'Error', 'Failed to add address: ' + errorText);
      }
    } catch (err) {
      showAlert('error', 'Error', 'Error adding address: ' + err.message);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          showAlert('success', 'Address Deleted', 'Address deleted successfully!');
          await fetchAddresses();
        } else {
          throw new Error('Failed to delete address');
        }
      } catch (err) {
        showAlert('error', 'Error', 'Error deleting address: ' + err.message);
      }
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleRiderRegistrationSuccess = () => {
    setShowRiderRegistration(false);
    showAlert('success', 'Registration Successful', 'You have been registered as a rider! You can now access your rider dashboard.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9DC08B]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#40513B] mb-4">Error</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StyledTextField
          fullWidth
          label="First Name"
          value={profileData.firstName}
          onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
        />
        <StyledTextField
          fullWidth
          label="Last Name"
          value={profileData.lastName}
          onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StyledTextField
          fullWidth
          label="Email"
          type="email"
          value={profileData.email}
          disabled
        />
        <StyledTextField
          fullWidth
          label="Phone"
          value={profileData.phone}
          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            value={profileData.dateOfBirth || ''}
            onChange={(e) => {
              console.log('Date input changed:', e.target.value); // Debug log
              setProfileData({...profileData, dateOfBirth: e.target.value});
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9DC08B] focus:border-transparent"
          />
  
        </div>
        <StyledTextField
          fullWidth
          label="Gender"
          select
          value={profileData.gender}
          onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
          InputLabelProps={{
            shrink: true,
          }}
          SelectProps={{
            native: true,
          }}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </StyledTextField>
      </div>

      <StyledButton variant="contained" onClick={handleProfileUpdate}>
        Update Profile
      </StyledButton>
    </div>
  );

  const renderAddressTab = () => (
    <div className="space-y-6">
      {/* Add New Address Form */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-[#40513B] mb-4">Add New Address</h3>
        <div className="space-y-4">
          <StyledTextField
            fullWidth
            label="Street Address"
            multiline
            rows={3}
            value={newAddress.street}
            onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StyledTextField
              fullWidth
              label="City"
              value={newAddress.city}
              onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
            />
            <StyledTextField
              fullWidth
              label="Division/State"
              value={newAddress.division}
              onChange={(e) => setNewAddress({...newAddress, division: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StyledTextField
              fullWidth
              label="Country"
              value={newAddress.country}
              onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
            />
            <StyledTextField
              fullWidth
              label="Postal Code"
              value={newAddress.postalCode}
              onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})}
            />
          </div>

          <StyledButton variant="contained" onClick={handleAddressUpdate}>
            Add Address
          </StyledButton>
        </div>
      </div>

      {/* Existing Addresses */}
      <div>
        <h3 className="text-lg font-semibold text-[#40513B] mb-4">Your Addresses</h3>
        {addresses.length === 0 ? (
          <p className="text-gray-600">No addresses found. Add your first address above.</p>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div key={address.id} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-[#40513B]">{address.street}</p>
                    <p className="text-gray-600">
                      {address.city}, {address.division} {address.postal_code}
                    </p>
                    <p className="text-gray-600">{address.country}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderOrdersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Order History</h3>
      </div>
      
      {ordersLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold">Order {order.secure_order_id || `#${order.id}`}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.order_date).toLocaleDateString()}
                  </p>
                  {order.transaction_id && (
                    <p className="text-xs text-gray-500">
                      TXN: {order.transaction_id}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold">৳{order.total_price}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    order.status === 'Delivered' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="product-image-container w-12 h-12">
                        <img 
                          src={item.product_image} 
                          alt={item.product_name}
                          className="w-full h-full object-cover rounded product-image-zoom"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-gray-600">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium">৳{item.price}</p>
                  </div>
                ))}
              </div>
              
              {order.address && (
                <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                  <p className="font-medium">Shipping Address:</p>
                  <p>{order.address.street}, {order.address.city}</p>
                  <p>{order.address.division}, {order.address.country} {order.address.postal_code}</p>
                </div>
              )}
              
              {order.payment_method && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>Payment: {order.payment_method}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-semibold text-[#40513B] mb-4">Account Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#40513B]">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive updates about orders and promotions</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-[#9DC08B]" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#40513B]">SMS Notifications</p>
              <p className="text-sm text-gray-600">Receive order updates via SMS</p>
            </div>
            <input type="checkbox" className="w-4 h-4 text-[#9DC08B]" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#40513B]">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">Add an extra layer of security</p>
            </div>
            <input type="checkbox" className="w-4 h-4 text-[#9DC08B]" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-semibold text-[#40513B] mb-4">Privacy Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#40513B]">Profile Visibility</p>
              <p className="text-sm text-gray-600">Make your profile visible to other users</p>
            </div>
            <input type="checkbox" className="w-4 h-4 text-[#9DC08B]" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#40513B]">Data Sharing</p>
              <p className="text-sm text-gray-600">Allow us to use your data for improvements</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-[#9DC08B]" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-semibold text-[#40513B] mb-4">Rider Options</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#40513B]">Become a Rider</p>
              <p className="text-sm text-gray-600">Join our delivery network and earn money</p>
            </div>
            <StyledButton
              variant="contained"
              startIcon={<LocalShippingIcon />}
              onClick={() => setShowRiderRegistration(true)}
              sx={{
                backgroundColor: '#9DC08B',
                '&:hover': {
                  backgroundColor: '#40513B',
                }
              }}
            >
              Register as Rider
            </StyledButton>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#40513B]">Rider Dashboard</p>
              <p className="text-sm text-gray-600">Access your rider dashboard</p>
            </div>
            <StyledButton
              variant="outlined"
              onClick={() => navigate('/rider-dashboard')}
              sx={{
                borderColor: '#40513B',
                color: '#40513B',
                '&:hover': {
                  borderColor: '#9DC08B',
                  backgroundColor: '#40513B',
                  color: 'white',
                }
              }}
            >
              Go to Dashboard
            </StyledButton>
          </div>
        </div>
      </div>

      <StyledButton
        variant="outlined"
        startIcon={<FaSignOutAlt />}
        onClick={handleLogout}
        sx={{
          borderColor: '#ef4444',
          color: '#ef4444',
          '&:hover': {
            borderColor: '#dc2626',
            backgroundColor: '#fef2f2',
          }
        }}
      >
        Logout
      </StyledButton>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderProfileTab();
      case 1:
        return renderAddressTab();
      case 2:
        return renderOrdersTab();
      case 3:
        return renderSettingsTab();
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

        {/* Rider Registration Dialog */}
        {showRiderRegistration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <RiderRegistration 
                onSuccess={handleRiderRegistrationSuccess}
                onCancel={() => setShowRiderRegistration(false)}
              />
            </div>
          </div>
        )}
        
        <h1 className="text-3xl font-bold text-[#40513B] mb-8">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-md sticky top-4">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-[#9DC08B] rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUser size={30} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#40513B]">
                  {profileData.firstName} {profileData.lastName}
                </h3>
                <p className="text-sm text-gray-600">{profileData.email}</p>
              </div>

              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs
                  orientation="vertical"
                  value={activeTab}
                  onChange={handleTabChange}
                  sx={{
                    '& .MuiTab-root': {
                      alignItems: 'flex-start',
                      textAlign: 'left',
                      color: '#40513B',
                      fontFamily: 'Montserrat, sans-serif',
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      minHeight: 'auto',
                      padding: '12px 16px',
                      '&.Mui-selected': {
                        color: '#9DC08B',
                        backgroundColor: '#f0f9ff',
                      },
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#9DC08B',
                    },
                  }}
                >
                  <Tab icon={<FaUser />} label="Profile" />
                  <Tab icon={<MdLocationOn />} label="Address" />
                  <Tab icon={<FaShoppingBag />} label="Orders" />
                  <Tab icon={<FaCog />} label="Settings" />
                </Tabs>
              </Box>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg p-6 shadow-md">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 