import React, { useState } from 'react';
import { Button as StyledButton, Radio, RadioGroup, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { FaMapMarkerAlt, FaPlus } from 'react-icons/fa';

const AddressSelector = ({ open, onClose, addresses, selectedAddressId, onAddressSelect, onAddNewAddress }) => {
  const [selectedAddress, setSelectedAddress] = useState(selectedAddressId);

  const handleAddressChange = (event) => {
    setSelectedAddress(event.target.value);
  };

  const handleAddressSelect = (addressId) => {
    console.log('Selected addressId:', addressId);
    setSelectedAddress(addressId);
    onAddressSelect(addressId);
    onClose();
  };

  const handleAddNew = () => {
    onAddNewAddress();
    onClose();
  };

  console.log('Addresses passed to selector:', addresses);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="text-[#40513B] font-bold">
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt className="text-[#9DC08B]" />
          Select Delivery Address
        </div>
      </DialogTitle>
      
      <DialogContent>
        {addresses.length === 0 ? (
          <div className="text-center py-8">
            <FaMapMarkerAlt size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-[#40513B] mb-2">No Addresses Found</h3>
            <p className="text-gray-600 mb-4">You need to add a delivery address to continue with your order.</p>
            <StyledButton
              variant="contained"
              startIcon={<FaPlus />}
              onClick={handleAddNew}
              sx={{
                backgroundColor: '#9DC08B',
                '&:hover': {
                  backgroundColor: '#40513B',
                }
              }}
            >
              Add New Address
            </StyledButton>
          </div>
        ) : (
          <div className="space-y-4">
            <RadioGroup value={selectedAddress} onChange={handleAddressChange}>
              {addresses.map((address) => (
                <div key={address.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#9DC08B] transition-colors">
                  <FormControlLabel
                    value={address.id}
                    control={<Radio sx={{ color: '#9DC08B', '&.Mui-checked': { color: '#40513B' } }} />}
                    label={
                      <div className="ml-2">
                        <div className="font-semibold text-[#40513B]">
                          {address.street}
                        </div>
                        <div className="text-sm text-gray-600">
                          {address.city}, {address.division}
                        </div>
                        <div className="text-sm text-gray-600">
                          {address.country} - {address.postal_code}
                        </div>
                      </div>
                    }
                  />
                </div>
              ))}
            </RadioGroup>
            
            <div className="pt-4 border-t border-gray-200">
              <StyledButton
                variant="outlined"
                startIcon={<FaPlus />}
                onClick={handleAddNew}
                fullWidth
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
      </DialogContent>
      
      {addresses.length > 0 && (
        <DialogActions className="p-6">
          <StyledButton
            onClick={onClose}
            sx={{
              color: '#40513B',
              '&:hover': {
                backgroundColor: '#EDF6E5',
              }
            }}
          >
            Cancel
          </StyledButton>
          <StyledButton
            onClick={() => handleAddressSelect(selectedAddress)}
            variant="contained"
            disabled={!selectedAddress}
            sx={{
              backgroundColor: '#9DC08B',
              '&:hover': {
                backgroundColor: '#40513B',
              },
              '&:disabled': {
                backgroundColor: '#ccc',
                color: '#666',
              }
            }}
          >
            Confirm Address
          </StyledButton>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default AddressSelector; 