# 🚀 E-Commerce Project Deployment Guide

## Overview
This guide will help you deploy your e-commerce project to production:
- **Database**: Supabase (PostgreSQL)
- **Backend**: Render (FastAPI)
- **Frontend**: Netlify (React)

---

## 📊 Step 1: Database Setup (Supabase)

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and API keys

### 1.2 Database Migration
1. Get your database connection string from Supabase dashboard
2. Update your backend configuration

### 1.3 Required Environment Variables for Backend
```bash
# Database Configuration (Supabase)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres

# JWT Configuration
SECRET_KEY=your-super-secret-jwt-key-here

# SSL Commerz Configuration
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_SANDBOX=False
SSLCOMMERZ_SUCCESS_URL=https://your-backend-url.onrender.com/api/v1/payment/sslcommerz/success
SSLCOMMERZ_FAIL_URL=https://your-backend-url.onrender.com/api/v1/payment/sslcommerz/fail
SSLCOMMERZ_CANCEL_URL=https://your-backend-url.onrender.com/api/v1/payment/sslcommerz/cancel
SSLCOMMERZ_IPN_URL=https://your-backend-url.onrender.com/api/v1/payment/sslcommerz/ipn

# Frontend URLs for redirects (Netlify)
FRONTEND_SUCCESS_URL=https://your-app-name.netlify.app/payment/success
FRONTEND_FAIL_URL=https://your-app-name.netlify.app/payment/fail
FRONTEND_CANCEL_URL=https://your-app-name.netlify.app/payment/cancel
```

---

## ⚙️ Step 2: Backend Deployment (Render)

### 2.1 Prepare Backend
1. Create a `render.yaml` file in your backend root
2. Update database connection in `app/config.py`
3. Ensure all dependencies are in `requirements.txt`

### 2.2 Render Configuration
```yaml
# render.yaml
services:
  - type: web
    name: ecommerce-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: SECRET_KEY
        sync: false
      - key: SSLCOMMERZ_STORE_ID
        sync: false
      - key: SSLCOMMERZ_STORE_PASSWORD
        sync: false
      - key: SSLCOMMERZ_SANDBOX
        value: "False"
      - key: SSLCOMMERZ_SUCCESS_URL
        sync: false
      - key: SSLCOMMERZ_FAIL_URL
        sync: false
      - key: SSLCOMMERZ_CANCEL_URL
        sync: false
      - key: SSLCOMMERZ_IPN_URL
        sync: false
      - key: FRONTEND_SUCCESS_URL
        sync: false
      - key: FRONTEND_FAIL_URL
        sync: false
      - key: FRONTEND_CANCEL_URL
        sync: false
```

### 2.3 Deploy to Render
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy and get your backend URL

---

## 🌐 Step 3: Frontend Deployment (Netlify)

### 3.1 Update Frontend Configuration
Update `src/config.js`:
```javascript
// API Configuration (Production)
export const API_BASE_URL = 'https://your-backend-url.onrender.com/api/v1';

// SSLCommerz Configuration (Production)
export const SSLCOMMERZ_CONFIG = {
  successUrl: 'https://your-app-name.netlify.app/payment/success',
  failUrl: 'https://your-app-name.netlify.app/payment/fail',
  cancelUrl: 'https://your-app-name.netlify.app/payment/cancel'
};
```

### 3.2 Build and Deploy
1. Build your React app: `npm run build`
2. Deploy to Netlify (drag & drop or Git integration)
3. Set custom domain if needed

---

## 🔧 Required Updates

### Backend Updates Needed:
1. **Database Connection**: Update to use Supabase
2. **CORS**: Allow your Netlify domain
3. **Environment Variables**: Use production URLs

### Frontend Updates Needed:
1. **API Endpoints**: Point to Render backend
2. **Payment URLs**: Update SSLCommerz redirects
3. **Build Optimization**: Ensure production build works

---

## 🚨 Important Notes

1. **Environment Variables**: Never commit sensitive data
2. **CORS**: Update backend to allow Netlify domain
3. **SSL**: Ensure HTTPS for payment processing
4. **Database**: Backup before migration
5. **Testing**: Test payment flow in production

---

## 📝 Checklist

- [ ] Supabase project created
- [ ] Database migrated to Supabase
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Netlify
- [ ] Payment flow tested
- [ ] CORS configured
- [ ] Environment variables set
- [ ] SSL certificates working
- [ ] Domain configured (if custom)

---

## 🆘 Troubleshooting

### Common Issues:
1. **CORS Errors**: Check backend CORS configuration
2. **Database Connection**: Verify Supabase connection string
3. **Payment Redirects**: Ensure URLs are HTTPS
4. **Build Failures**: Check dependency versions

### Support:
- Supabase: [docs.supabase.com](https://docs.supabase.com)
- Render: [render.com/docs](https://render.com/docs)
- Netlify: [docs.netlify.com](https://docs.netlify.com)
