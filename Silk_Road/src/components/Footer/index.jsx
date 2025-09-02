import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';

const Footer = () => {
  return (
    <footer className="bg-[#40513B] text-white font-montserrat">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/logo4.png" alt="Silk Road" className="w-12 h-12 rounded" />
              <h3 className="text-xl font-bold">Silk Road</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Your trusted destination for quality products. We bring you the best selection 
              of products at reasonable prices.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-[#9DC08B] transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#9DC08B] transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#9DC08B] transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#9DC08B] transition-colors">
                <FaLinkedin size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#9DC08B] transition-colors">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#9DC08B]">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-[#9DC08B] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-[#9DC08B] transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-300 hover:text-[#9DC08B] transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/deals" className="text-gray-300 hover:text-[#9DC08B] transition-colors">
                  Deals & Offers
                </Link>
              </li>
              <li>
                <Link to="/new-arrivals" className="text-gray-300 hover:text-[#9DC08B] transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/trending" className="text-gray-300 hover:text-[#9DC08B] transition-colors">
                  Trending
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#9DC08B]">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/help-center" className="text-gray-300 hover:text-[#9DC08B] transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-[#9DC08B] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/order-tracking" className="text-gray-300 hover:text-[#9DC08B] transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-300 hover:text-[#9DC08B] transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-300 hover:text-[#9DC08B] transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-[#9DC08B] transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#9DC08B]">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MdLocationOn className="text-[#9DC08B]" size={20} />
                <div>
                  <p className="text-gray-300">11/4 Hosseni Dalan</p>
                  <p className="text-gray-300">Dhaka, Bangladesh</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MdPhone className="text-[#9DC08B]" size={20} />
                <div>
                  <p className="text-gray-300">+880 1792-581144</p>
                  <p className="text-gray-300">+880 1234-567891</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MdEmail className="text-[#9DC08B]" size={20} />
                <div>
                  <p className="text-gray-300">info@silkroad.com</p>
                  <p className="text-gray-300">support@silkroad.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Subscription */}
      <div className="border-t border-gray-600 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-[#9DC08B]">
              Subscribe to Our Newsletter
            </h3>
            <p className="text-gray-300 max-w-md mx-auto">
              Get the latest updates on new products, exclusive offers, and fashion trends.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-2 rounded-md border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-[#9DC08B]"
              />
              <button className="px-6 py-2 bg-[#9DC08B] text-white rounded-md hover:bg-[#40513B] transition-colors font-medium">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-600 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-300 text-sm">
              © 2024 Silk Road. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-300 hover:text-[#9DC08B] transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-300 hover:text-[#9DC08B] transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-300 hover:text-[#9DC08B] transition-colors">
                Cookie Policy
              </Link>
              <Link to="/sitemap" className="text-gray-300 hover:text-[#9DC08B] transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>

  
    </footer>
  );
};

export default Footer; 