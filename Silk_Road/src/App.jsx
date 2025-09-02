import { useState, useEffect } from 'react'
import Header from './components/Header'
import Home from './Pages/Home'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import trackingService from './services/trackingService'
import Login from './Pages/Login'
import Register from './Pages/Register'
import ProductDetail from './Pages/ProductDetail'
import Cart from './Pages/Cart'
import Checkout from './Pages/Checkout'
import Profile from './Pages/Profile'
import OrderTracking from './Pages/OrderTracking'
import HelpCenter from './Pages/HelpCenter'
import Wishlist from './Pages/Wishlist'
import CompareProducts from './Pages/CompareProducts'
import Category from './Pages/Category'
import SearchResults from './Pages/SearchResults'
import AllProducts from './Pages/AllProducts'
import OrderConfirmation from './Pages/OrderConfirmation'
import PaymentSuccess from './Pages/PaymentSuccess'
import PaymentFail from './Pages/PaymentFail'
import PaymentCancel from './Pages/PaymentCancel'
import AdminDashboard from './Pages/AdminDashboard'
import AdminUsersPage from './Pages/AdminPages/AdminUsersPage'
import AdminProductsPage from './Pages/AdminPages/AdminProductsPage'
import AdminCartsPage from './Pages/AdminPages/AdminCartsPage'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import AdminOrdersPage from './Pages/AdminPages/AdminOrdersPage';
import AdminReviewsPage from './Pages/AdminPages/AdminReviewsPage';
import AdminCouponsPage from './Pages/AdminPages/AdminCouponsPage';
import AdminUserDetail from './Pages/AdminPages/AdminUserDetail';
import AdminAnalyticsPage from './Pages/AdminPages/AdminAnalyticsPage';
import AdminRidersPage from './Pages/AdminPages/AdminRidersPage';
import RiderDashboard from './Pages/RiderDashboard';
import AdvancedAnalyticsDashboard from './components/Admin/AdvancedAnalyticsDashboard';

function App() {
  useEffect(() => {
    // Initialize tracking service with real user data
    trackingService.init();
    
    // Track page views on route changes
    const handleRouteChange = () => {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      trackingService.trackPageView(
        window.location.pathname,
        currentUser.id,
        currentUser.customer_id
      );
    };
    
    // Track initial page view
    handleRouteChange();
    
    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="/admin/advanced-analytics" element={<AdvancedAnalyticsDashboard />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/products" element={<AdminProductsPage />} />
        <Route path="/admin/carts" element={<AdminCartsPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/reviews" element={<AdminReviewsPage />} />
        <Route path="/admin/coupons" element={<AdminCouponsPage />} />
                        <Route path="/admin/riders" element={<AdminRidersPage />} />
                <Route path="/rider-dashboard" element={<RiderDashboard />} />
        <Route path="/admin/users/:id" element={<AdminUserDetail />} />
        <Route path="/*" element={
          <>
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/order-tracking" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
              <Route path="/help-center" element={<HelpCenter />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/compare" element={<CompareProducts />} />
              <Route path="/category/:categoryName" element={<Category />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/all-products" element={<AllProducts />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/fail" element={<PaymentFail />} />
              <Route path="/payment/cancel" element={<PaymentCancel />} />
            </Routes>
            <Footer />
          </>
        } />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
