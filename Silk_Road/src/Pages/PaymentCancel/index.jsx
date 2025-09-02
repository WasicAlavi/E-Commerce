import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button as StyledButton } from '@mui/material';
import { FaBan, FaArrowLeft, FaHome } from 'react-icons/fa';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const tran_id = searchParams.get('tran_id');

  return (
    <div className="bg-[#EDF6E5] min-h-screen py-12 font-montserrat">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Cancel Icon */}
          <div className="mb-8">
            <FaBan size={80} className="mx-auto text-orange-500 mb-4" />
            <h1 className="text-4xl font-bold text-[#40513B] mb-4">
              Payment Cancelled
            </h1>
            <p className="text-lg text-[#40513B] mb-8">
              You have cancelled the payment process. No charges have been made to your account.
            </p>
          </div>

          {/* Cancellation Details */}
          <div className="bg-white rounded-lg p-8 shadow-md mb-8">
            <h2 className="text-2xl font-bold text-[#40513B] mb-6">Cancellation Details</h2>
            <div className="space-y-4 text-left">
              {tran_id && (
                <div className="flex justify-between">
                  <span className="text-[#40513B]">Transaction ID:</span>
                  <span className="font-semibold text-[#9DC08B]">{tran_id}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#40513B]">Payment Status:</span>
                <span className="text-orange-600 font-semibold">Cancelled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#40513B]">Charges:</span>
                <span className="text-green-600 font-semibold">None</span>
              </div>
            </div>
          </div>

          {/* Information Section */}
          <div className="bg-orange-50 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-[#40513B] mb-4">What happened?</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-semibold text-[#40513B]">Payment Cancelled</p>
                  <p className="text-sm text-[#40513B]">You chose to cancel the payment process before completion.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-semibold text-[#40513B]">No Charges</p>
                  <p className="text-sm text-[#40513B]">No money has been deducted from your account.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-semibold text-[#40513B]">Try Again</p>
                  <p className="text-sm text-[#40513B]">You can attempt the payment again whenever you're ready.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/cart">
              <StyledButton
                variant="contained"
                startIcon={<FaArrowLeft />}
                sx={{
                  backgroundColor: '#9DC08B',
                  '&:hover': {
                    backgroundColor: '#40513B',
                  }
                }}
              >
                Try Again
              </StyledButton>
            </Link>
            <Link to="/">
              <StyledButton
                variant="outlined"
                startIcon={<FaHome />}
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
                Continue Shopping
              </StyledButton>
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-[#40513B] mb-2">Your cart items are still saved</p>
            <p className="text-sm text-gray-600">You can complete your purchase anytime from your cart</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel; 