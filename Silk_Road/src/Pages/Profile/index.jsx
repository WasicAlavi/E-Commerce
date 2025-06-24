import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { FaUser, FaShoppingBag, FaHeart, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { MdLocationOn, MdPayment } from 'react-icons/md';

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
  const [activeTab, setActiveTab] = useState(0);
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+880 1234-567890',
    dateOfBirth: '1990-01-01',
    gender: 'Male'
  });
  const [addressData, setAddressData] = useState({
    address: '123 Main Street',
    city: 'Dhaka',
    postalCode: '1200',
    country: 'Bangladesh'
  });

  // Mock order history
  const orders = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      status: 'Delivered',
      total: 5500,
      items: [
        { name: 'Premium Cotton T-Shirt', quantity: 2, price: 2500 },
        { name: 'Denim Jeans', quantity: 1, price: 3000 }
      ]
    },
    {
      id: 'ORD-002',
      date: '2024-01-10',
      status: 'Shipped',
      total: 3500,
      items: [
        { name: 'Wireless Earbuds', quantity: 1, price: 3500 }
      ]
    }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleProfileUpdate = () => {
    console.log('Profile updated:', profileData);
    alert('Profile updated successfully!');
  };

  const handleAddressUpdate = () => {
    console.log('Address updated:', addressData);
    alert('Address updated successfully!');
  };

  const handleLogout = () => {
    console.log('User logged out');
    // Add logout logic here
  };

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
          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
        />
        <StyledTextField
          fullWidth
          label="Phone"
          value={profileData.phone}
          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StyledTextField
          fullWidth
          label="Date of Birth"
          type="date"
          value={profileData.dateOfBirth}
          onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
          InputLabelProps={{ shrink: true }}
        />
        <StyledTextField
          fullWidth
          label="Gender"
          value={profileData.gender}
          onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
        />
      </div>

      <StyledButton variant="contained" onClick={handleProfileUpdate}>
        Update Profile
      </StyledButton>
    </div>
  );

  const renderAddressTab = () => (
    <div className="space-y-6">
      <StyledTextField
        fullWidth
        label="Address"
        multiline
        rows={3}
        value={addressData.address}
        onChange={(e) => setAddressData({...addressData, address: e.target.value})}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StyledTextField
          fullWidth
          label="City"
          value={addressData.city}
          onChange={(e) => setAddressData({...addressData, city: e.target.value})}
        />
        <StyledTextField
          fullWidth
          label="Postal Code"
          value={addressData.postalCode}
          onChange={(e) => setAddressData({...addressData, postalCode: e.target.value})}
        />
        <StyledTextField
          fullWidth
          label="Country"
          value={addressData.country}
          onChange={(e) => setAddressData({...addressData, country: e.target.value})}
        />
      </div>

      <StyledButton variant="contained" onClick={handleAddressUpdate}>
        Update Address
      </StyledButton>
    </div>
  );

  const renderOrdersTab = () => (
    <div className="space-y-6">
      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[#40513B]">Order #{order.id}</h3>
              <p className="text-sm text-gray-600">Placed on {order.date}</p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.status === 'Delivered' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {order.status}
              </span>
              <p className="text-lg font-bold text-[#9DC08B] mt-1">৳{order.total}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm text-[#40513B]">
                <span>{item.name} x{item.quantity}</span>
                <span>৳{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <StyledButton variant="outlined" size="small">
              View Details
            </StyledButton>
          </div>
        </div>
      ))}
    </div>
  );

  const renderWishlistTab = () => (
    <div className="text-center py-12">
      <FaHeart size={60} className="mx-auto text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold text-[#40513B] mb-2">Your Wishlist is Empty</h3>
      <p className="text-gray-600 mb-6">Start adding items to your wishlist to see them here.</p>
      <StyledButton variant="contained">
        Start Shopping
      </StyledButton>
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
        return renderWishlistTab();
      case 4:
        return renderSettingsTab();
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#EDF6E5] min-h-screen py-8 font-montserrat">
      <div className="container mx-auto px-4">
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
                  <Tab icon={<FaHeart />} label="Wishlist" />
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