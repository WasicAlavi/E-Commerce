import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button as StyledButton } from '@mui/material';
import { FaTimesCircle, FaArrowLeft, FaHome } from 'react-icons/fa';

const PaymentFail = () => {
  const [searchParams] = useSearchParams();
  const tran_id = searchParams.get('tran_id');
  const error = searchParams.get('error');

  return (
    <div className="bg-[#EDF6E5] min-h-screen py-12 font-montserrat">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Error Icon */}
          <div className="mb-8">
            <FaTimesCircle size={80} className="mx-auto text-red-500 mb-4" />
            <h1 className="text-4xl font-bold text-[#40513B] mb-4">
              Payment Failed
            </h1>
            <p className="text-lg text-[#40513B] mb-8">
              Unfortunately, your payment could not be processed. Please try again or contact support if the problem persists.
            </p>
          </div>

          {/* Error Details */}
          <div className="bg-white rounded-lg p-8 shadow-md mb-8">
            <h2 className="text-2xl font-bold text-[#40513B] mb-6">Payment Details</h2>
            <div className="space-y-4 text-left">
              {tran_id && (
                <div className="flex justify-between">
                  <span className="text-[#40513B]">Transaction ID:</span>
                  <span className="font-semibold text-[#9DC08B]">{tran_id}</span>
                </div>
              )}
              {error && (
                <div className="flex justify-between">
                  <span className="text-[#40513B]">Error:</span>
                  <span className="font-semibold text-red-500">{error}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#40513B]">Payment Status:</span>
                <span className="text-red-600 font-semibold">Failed</span>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-red-50 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-[#40513B] mb-4">What went wrong?</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-semibold text-[#40513B]">Insufficient Funds</p>
                  <p className="text-sm text-[#40513B]">Your card may not have sufficient funds for this transaction.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-semibold text-[#40513B]">Card Issues</p>
                  <p className="text-sm text-[#40513B]">Your card may be expired, blocked, or not supported.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-semibold text-[#40513B]">Network Issues</p>
                  <p className="text-sm text-[#40513B]">Temporary network issues may have caused the failure.</p>
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

          {/* Support Contact */}
          <div className="mt-8 text-center">
            <p className="text-[#40513B] mb-2">Need help? Contact our support team</p>
            <p className="text-[#9DC08B] font-semibold">support@silkroad.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFail; 