// API Configuration (Production)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://silk-road-k826.onrender.com/api/v1';ommit 

// SSLCommerz Configuration (Production)
export const SSLCOMMERZ_CONFIG = {
  successUrl: import.meta.env.VITE_SSLCOMMERZ_SUCCESS_URL || 'https://jovial-haupia-9f2dd7.netlify.app/payment/success',
  failUrl: import.meta.env.VITE_SSLCOMMERZ_FAIL_URL || 'https://jovial-haupia-9f2dd7.netlify.app/payment/fail',
  cancelUrl: import.meta.env.VITE_SSLCOMMERZ_CANCEL_URL || 'https://jovial-haupia-9f2dd7.netlify.app/payment/cancel'
}; 