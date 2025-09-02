// API Configuration (Production)
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://silk-road-k826.onrender.com/api/v1';

// SSLCommerz Configuration (Production)
export const SSLCOMMERZ_CONFIG = {
  successUrl: process.env.REACT_APP_SSLCOMMERZ_SUCCESS_URL || 'https://jovial-haupia-9f2dd7.netlify.app/payment/success',
  failUrl: process.env.REACT_APP_SSLCOMMERZ_FAIL_URL || 'https://jovial-haupia-9f2dd7.netlify.app/payment/fail',
  cancelUrl: process.env.REACT_APP_SSLCOMMERZ_CANCEL_URL || 'https://jovial-haupia-9f2dd7.netlify.app/payment/cancel'
}; 