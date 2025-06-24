import { useState } from 'react'
import Header from './components/Header'
import Home from './Pages/Home'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
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
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

function App() {

  return (
    <>
    <BrowserRouter>
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
      </Routes>
      <Footer />
    </BrowserRouter>
    </>
  )
}

export default App
