# 🚨 Fix Localhost URLs in Frontend

## **Problem Found:**
Your frontend has **50+ files** with hardcoded localhost URLs that need to be replaced with `API_BASE_URL`.

## **Solution:**
Replace all `http://localhost:8000/api/v1` with `${API_BASE_URL}`

## **Files to Fix:**

### **1. Core Pages (Priority 1):**
- `Silk_Road/src/Pages/Home/index.jsx` - 8 URLs
- `Silk_Road/src/Pages/ProductDetail/index.jsx` - 6 URLs
- `Silk_Road/src/Pages/Cart/index.jsx` - 8 URLs
- `Silk_Road/src/Pages/Wishlist/index.jsx` - 8 URLs
- `Silk_Road/src/Pages/Profile/index.jsx` - 6 URLs

### **2. Admin Pages (Priority 2):**
- `Silk_Road/src/Pages/AdminPages/AdminDashboard/index.jsx` - 7 URLs
- `Silk_Road/src/Pages/AdminPages/AdminOrdersPage.jsx` - 4 URLs
- `Silk_Road/src/Pages/AdminPages/AdminProductsPage.jsx` - 3 URLs
- `Silk_Road/src/Pages/AdminPages/AdminCouponsPage.jsx` - 4 URLs

### **3. Components (Priority 3):**
- `Silk_Road/src/components/ProductCard/index.jsx` - 1 URL
- `Silk_Road/src/components/Search/index.jsx` - 1 URL
- `Silk_Road/src/components/Header/Navigation/CategoryPanel.jsx` - 1 URL

## **How to Fix:**

### **Option 1: Manual Replacement (Recommended)**
1. Import `API_BASE_URL` in each file:
   ```javascript
   import { API_BASE_URL } from '../../config';  // Adjust path as needed
   ```

2. Replace all URLs:
   ```javascript
   // OLD:
   fetch('http://localhost:8000/api/v1/products')
   
   // NEW:
   fetch(`${API_BASE_URL}/products`)
   ```

### **Option 2: Search and Replace (Faster)**
Use your editor's search and replace:
- **Find:** `http://localhost:8000/api/v1`
- **Replace:** `${API_BASE_URL}`

## **Example Fix:**

```javascript
// Before:
const response = await fetch('http://localhost:8000/api/v1/products');

// After:
import { API_BASE_URL } from '../../../config';
const response = await fetch(`${API_BASE_URL}/products`);
```

## **After Fixing:**
1. **Rebuild** your app: `npm run build`
2. **Redeploy** to Netlify
3. **Test** that all API calls work

## **Total URLs to Fix: 50+**
This is why your app is still trying to connect to localhost!
