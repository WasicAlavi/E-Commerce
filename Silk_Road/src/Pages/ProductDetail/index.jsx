import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, Pagination } from 'swiper/modules';
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { IoIosGitCompare } from "react-icons/io";
import { MdOutlineShoppingCart } from "react-icons/md";
import ProductCard from '../../components/ProductCard';
import { useAuth } from '../../AuthContext';
import cartService from '../../services/cartService';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/pagination';

const StyledButton = styled(Button)(({ theme }) => ({
  fontFamily: 'Montserrat, sans-serif',
  backgroundColor: '#9DC08B',
  color: '#fff',
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 500,
  padding: '10px 20px',
  '&:hover': {
    backgroundColor: '#40513B',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    fontFamily: 'Montserrat, sans-serif',
    color: '#40513B',
  },
  '& .MuiInputLabel-root': {
    fontFamily: 'Montserrat, sans-serif',
    color: '#40513B',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#9DC08B',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#9DC08B',
    },
    '&:hover fieldset': {
      borderColor: '#40513B',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#9DC08B',
    },
  },
}));

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showCartNotification, setShowCartNotification] = useState(false);

  // Mock product data - replace with API call
  useEffect(() => {
    async function fetchProduct() {
      const res = await fetch(`http://localhost:8000/api/v1/products/card/${id}`);
      const data = await res.json();
      // Optionally fetch all images:
      const imagesRes = await fetch(`http://localhost:8000/api/v1/products/${id}/images`);
      const images = await imagesRes.json();
      setProduct({ ...data, images: images.map(img => img.image_url) });
    }
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      // Check if user is logged in
      if (!currentUser) {
        navigate('/login', { state: { from: `/product/${id}` } });
        return;
      }

      // Validate selections if options exist
      const requiresSize = product.sizes && product.sizes.length > 0;
      const requiresColor = product.colors && product.colors.length > 0;

      if (requiresSize && !selectedSize) {
        alert('Please select a size');
        return;
      }

      if (requiresColor && !selectedColor) {
        alert('Please select a color');
        return;
      }

      // Get or create cart
      const cart = await cartService.getOrCreateCart();

      // Prepare options
      const options = {};
      if (requiresSize) options.size = selectedSize;
      if (requiresColor) options.color = selectedColor;

      // Add item to cart
      await cartService.addItemToCart(
        cart.id,
        product.id,
        quantity,
        options
      );

      // Show success notification
      setShowCartNotification(true);
      setTimeout(() => setShowCartNotification(false), 3000);

    } catch (error) {
      alert(error.message || 'Failed to add to cart');
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    console.log('Wishlist toggled');
  };

  const handleCompare = () => {
    console.log('Added to compare');
  };

  const handleBuyNow = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select size and color');
      return;
    }
    console.log('Buy now:', { product, quantity, selectedSize, selectedColor });
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-[#EDF6E5] flex items-center justify-center">
        <div className="text-[#40513B] text-xl">Loading...</div>
      </div>
    );
  }

  const discountedPrice = Math.round(product.price * (1 - product.discount));

  return (
    <div className="bg-[#EDF6E5] min-h-screen py-8 font-montserrat">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-[#40513B]">
            <li><Link to="/" className="hover:text-[#9DC08B]">Home</Link></li>
            <li>/</li>
            <li><Link to={`/category/${product.category}`} className="hover:text-[#9DC08B]">{product.category}</Link></li>
            <li>/</li>
            <li className="text-[#9DC08B]">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <Swiper
              spaceBetween={10}
              navigation={true}
              thumbs={{ swiper: thumbsSwiper }}
              modules={[Navigation, Thumbs]}
              className="h-96"
            >
              {product.images.map((image, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            <Swiper
              onSwiper={setThumbsSwiper}
              spaceBetween={10}
              slidesPerView={4}
              freeMode={true}
              watchSlidesProgress={true}
              modules={[Navigation, Thumbs]}
              className="h-24"
            >
              {product.images.map((image, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg cursor-pointer"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-[#40513B] mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <Rating value={product.rating} precision={0.5} readOnly />
                <span className="text-[#40513B]">({product.reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-[#9DC08B]">৳{discountedPrice}</span>
                <span className="text-lg text-gray-500 line-through">৳{product.price}</span>
                <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                  {product.discount * 100}% OFF
                </span>
              </div>
            </div>

            <div>
              <p className="text-[#40513B] leading-relaxed">{product.description}</p>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold text-[#40513B] mb-3">Size</h3>
              <div className="flex gap-2">
                {product.sizes && product.sizes.length > 0 ? (
                  product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-md transition-colors ${selectedSize === size
                        ? 'border-[#9DC08B] bg-[#9DC08B] text-white'
                        : 'border-[#9DC08B] text-[#40513B] hover:bg-[#9DC08B] hover:text-white'
                        }`}
                    >
                      {size}
                    </button>
                  ))
                ) : (
                  <span>No sizes available</span>
                )}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-lg font-semibold text-[#40513B] mb-3">Color</h3>
              <div className="flex gap-2">
                {product.colors && product.colors.length > 0 ? (
                  product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border rounded-md transition-colors ${selectedColor === color
                        ? 'border-[#9DC08B] bg-[#9DC08B] text-white'
                        : 'border-[#9DC08B] text-[#40513B] hover:bg-[#9DC08B] hover:text-white'
                        }`}
                    >
                      {color}
                    </button>
                  ))
                ) : (
                  <span>No colors available</span>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold text-[#40513B] mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <StyledTextField
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  inputProps={{ min: 1, max: product.stock }}
                  sx={{ width: 100 }}
                />
                <span className="text-[#40513B]">Available: {product.stock}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <StyledButton
                variant="contained"
                startIcon={<MdOutlineShoppingCart />}
                onClick={handleAddToCart}
                sx={{ flex: 1 }}
              >
                Add to Cart
              </StyledButton>
              <StyledButton
                variant="contained"
                onClick={handleBuyNow}
                sx={{ flex: 1 }}
              >
                Buy Now
              </StyledButton>
            </div>

            {/* Wishlist & Compare */}
            <div className="flex gap-4">
              <button
                onClick={handleWishlist}
                className={`flex items-center gap-2 px-4 py-2 border rounded-md transition-colors ${isWishlisted
                  ? 'border-red-500 bg-red-500 text-white'
                  : 'border-[#9DC08B] text-[#40513B] hover:bg-[#9DC08B] hover:text-white'
                  }`}
              >
                {isWishlisted ? <FaHeart /> : <FaRegHeart />}
                {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
              </button>
              <button
                onClick={handleCompare}
                className="flex items-center gap-2 px-4 py-2 border border-[#9DC08B] text-[#40513B] rounded-md hover:bg-[#9DC08B] hover:text-white transition-colors"
              >
                <IoIosGitCompare />
                Compare
              </button>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12 bg-white rounded-lg p-6">
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {['Description', 'Features', 'Specifications', 'Reviews'].map((tab, index) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(index)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === index
                    ? 'border-[#9DC08B] text-[#9DC08B]'
                    : 'border-transparent text-[#40513B] hover:text-[#9DC08B] hover:border-[#9DC08B]'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {showCartNotification && (
            <div
              className="fixed bottom-8 right-8 z-50 px-6 py-4 rounded-xl shadow-2xl bg-[#9DC08B] text-white font-semibold text-lg flex items-center gap-3 transition-all duration-500 ease-in-out animate-slide-fade-in"
              style={{
                boxShadow: '0 8px 32px 0 rgba(64, 81, 59, 0.15)',
                minWidth: '220px',
                opacity: showCartNotification ? 1 : 0,
                transform: showCartNotification ? 'translateY(0)' : 'translateY(40px)',
              }}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Item added to cart!
            </div>
          )}

          <div className="min-h-[200px]">
            {activeTab === 0 && (
              <div>
                <h3 className="text-xl font-semibold text-[#40513B] mb-4">Product Description</h3>
                <p className="text-[#40513B] leading-relaxed">{product.description}</p>
              </div>
            )}

            {activeTab === 1 && (
              <div>
                <h3 className="text-xl font-semibold text-[#40513B] mb-4">Product Features</h3>
                <ul className="list-disc list-inside space-y-2 text-[#40513B]">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 2 && (
              <div>
                <h3 className="text-xl font-semibold text-[#40513B] mb-4">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                      <span className="font-medium text-[#40513B]">{key}</span>
                      <span className="text-[#40513B]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div>
                <h3 className="text-xl font-semibold text-[#40513B] mb-4">Customer Reviews</h3>
                <div className="text-center py-8">
                  <p className="text-[#40513B]">Reviews coming soon...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-[#40513B] mb-6">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Mock related products */}
            {[1, 2, 3, 4].map((item) => (
              <ProductCard
                key={item}
                product={{
                  id: item,
                  name: `Related Product ${item}`,
                  price: 2000 + item * 500,
                  image: `/product${item}.jpg`,
                  discount: 0.2
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 