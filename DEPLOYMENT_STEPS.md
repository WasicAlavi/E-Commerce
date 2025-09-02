# 🚀 Step-by-Step Deployment Guide

## 📋 **Phase 1: Backend Deployment (Render)**

### 1.1 Prepare Backend
```bash
# Make sure your code is pushed to GitHub
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### 1.2 Deploy to Render
1. Go to [render.com](https://render.com)
2. Create account and connect GitHub
3. Create new **Web Service**
4. Select your repository
5. Set environment variables (use placeholder frontend URLs for now)

### 1.3 Environment Variables for Initial Backend Deployment
```bash
# Database (Supabase)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@fjgyhaeohgtsrhgsxnhm.supabase.co:5432/postgres

# JWT
SECRET_KEY=your-super-secret-jwt-key-here

# SSL Commerz (use placeholder backend URL for now)
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_SANDBOX=False
SSLCOMMERZ_SUCCESS_URL=https://[PLACEHOLDER].onrender.com/api/v1/payment/sslcommerz/success
SSLCOMMERZ_FAIL_URL=https://[PLACEHOLDER].onrender.com/api/v1/payment/sslcommerz/fail
SSLCOMMERZ_CANCEL_URL=https://[PLACEHOLDER].onrender.com/api/v1/payment/sslcommerz/cancel
SSLCOMMERZ_IPN_URL=https://[PLACEHOLDER].onrender.com/api/v1/payment/sslcommerz/ipn

# Frontend URLs (use placeholders for now)
FRONTEND_SUCCESS_URL=https://placeholder.netlify.app/payment/success
FRONTEND_FAIL_URL=https://placeholder.netlify.app/payment/fail
FRONTEND_CANCEL_URL=https://placeholder.netlify.app/payment/cancel
```

### 1.4 Get Your Backend URL
After deployment, Render will give you:
```
https://ecommerce-backend-abc123.onrender.com
```
**Save this URL!** 🎯

---

## 🌐 **Phase 2: Frontend Deployment (Netlify)**

### 2.1 Update Frontend Config
Update `src/config.js` with your actual backend URL:
```javascript
// API Configuration (Production)
export const API_BASE_URL = 'https://ecommerce-backend-abc123.onrender.com/api/v1';

// SSLCommerz Configuration (Production)
export const SSLCOMMERZ_CONFIG = {
  successUrl: 'https://[YOUR-NETLIFY-DOMAIN]/payment/success',
  failUrl: 'https://[YOUR-NETLIFY-DOMAIN]/payment/fail',
  cancelUrl: 'https://[YOUR-NETLIFY-DOMAIN]/payment/cancel'
};
```

### 2.2 Build and Deploy Frontend
```bash
cd Silk_Road
npm run build
```

### 2.3 Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Drag & drop your `build` folder
3. Get your frontend URL:
```
https://silk-road-abc123.netlify.app
```
**Save this URL too!** 🎯

---

## ⚙️ **Phase 3: Update Backend with Real URLs**

### 3.1 Update Backend Environment Variables
Go back to Render dashboard and update:

```bash
# SSL Commerz (use your actual backend URL)
SSLCOMMERZ_SUCCESS_URL=https://ecommerce-backend-abc123.onrender.com/api/v1/payment/sslcommerz/success
SSLCOMMERZ_FAIL_URL=https://ecommerce-backend-abc123.onrender.com/api/v1/payment/sslcommerz/fail
SSLCOMMERZ_CANCEL_URL=https://ecommerce-backend-abc123.onrender.com/api/v1/payment/sslcommerz/cancel
SSLCOMMERZ_IPN_URL=https://ecommerce-backend-abc123.onrender.com/api/v1/payment/sslcommerz/ipn

# Frontend URLs (use your actual Netlify URL)
FRONTEND_SUCCESS_URL=https://silk-road-abc123.netlify.app/payment/success
FRONTEND_FAIL_URL=https://silk-road-abc123.netlify.app/payment/fail
FRONTEND_CANCEL_URL=https://silk-road-abc123.netlify.app/payment/cancel
```

### 3.2 Update Backend CORS
Update `app/main.py` with your actual Netlify domain:
```python
allow_origins=[
    "http://localhost:5173", 
    "http://localhost:3000", 
    "http://127.0.0.1:5173", 
    "http://127.0.0.1:3000",
    "https://silk-road-abc123.netlify.app",  # Your actual Netlify domain
    "https://*.netlify.app"
],
```

### 3.3 Redeploy Backend
Push changes and redeploy on Render.

---

## ✅ **Final Checklist**

- [ ] Backend deployed on Render ✅
- [ ] Frontend deployed on Netlify ✅
- [ ] Backend URLs updated with real frontend domain ✅
- [ ] Frontend URLs updated with real backend domain ✅
- [ ] CORS configured for production ✅
- [ ] Payment flow tested ✅

---

## 🎯 **Key Points**

1. **Deploy backend first** → Get backend URL
2. **Deploy frontend second** → Get frontend URL  
3. **Update both with real URLs** → Complete integration
4. **Use placeholders initially** → Avoid deployment errors

This approach ensures you always have the URLs you need! 🚀
