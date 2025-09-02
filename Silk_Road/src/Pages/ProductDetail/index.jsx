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
import Recommendations from '../../components/Recommendations';
import { useAuth } from '../../AuthContext';
import cartService from '../../services/cartService';
import wishlistService from '../../services/wishlistService';
import CompareService from '../../services/compareService';
import CustomAlert from '../../components/Alert';
import trackingService from '../../services/trackingService';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/pagination';
import { API_BASE_URL } from '../../config';


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
  const { user: currentUser } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isInCompareList, setIsInCompareList] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [hasReviewed, setHasReviewed] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState(null);


  // Alert state management
  const [alert, setAlert] = useState({
    show: false,
    severity: 'info',
    title: '',
    message: ''
  });

  // Function to show custom alert
  const showAlert = (severity, title, message) => {
    setAlert({
      show: true,
      severity,
      title,
      message
    });
  };

  // Function to hide alert
  const hideAlert = () => {
    setAlert({
      show: false,
      severity: 'info',
      title: '',
      message: ''
    });
  };

  // Fetch product data with full details
  useEffect(() => {
    async function fetchProduct() {
      try {
        // Fetch full product details including sizes and colors
        const res = await fetch(`${API_BASE_URL}/products/${id}`);
        const data = await res.json();
        
        // Set product with all details
        setProduct({
          ...data,
          images: data.images.map(img => img.image_url),
          sizes: data.sizes || [],
          colors: data.colors || [],
          features: data.features || [],
          specifications: data.specifications || {}
        });
        
        // Track product view
        trackingService.trackProductView(
          data.id, 
          data.name, 
          currentUser?.id, 
          currentUser?.customer_id
        );
      } catch (error) {
        console.error('Error fetching product:', error);
        showAlert('error', 'Error', 'Failed to load product details');
      }
    }
    fetchProduct();
  }, [id]);

  // Check if product is in compare list
  useEffect(() => {
    if (id) {
      setIsInCompareList(CompareService.isInCompareList(parseInt(id)));
    }
  }, [id]);

  // Fetch reviews for this product
  useEffect(() => {
    if (!id) return;
    const fetchReviews = async () => {
      setReviewLoading(true);
      setReviewError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/reviews/product/${id}`);
        if (!res.ok) throw new Error('Failed to fetch reviews');
        const data = await res.json();
        setReviews(data.reviews || []);
        setAverageRating(data.average_rating || 0);
        setTotalReviews(data.total || 0);
      } catch (err) {
        setReviewError('Could not load reviews');
      } finally {
        setReviewLoading(false);
      }
    };
    fetchReviews();
  }, [id]);

  // Check if current user has already reviewed
  useEffect(() => {
    if (!currentUser?.id || !id) return;
    const checkReviewed = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/reviews/check/${currentUser.id}/${id}`);
        const data = await res.json();
        setHasReviewed(data.data?.exists || false);
      } catch {}
    };
    checkReviewed();
  }, [currentUser, id, reviews]);

  // Check purchase status for review eligibility
  useEffect(() => {
    if (!currentUser?.customer_id || !id) return;
    const checkPurchaseStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/reviews/check-purchase/${currentUser.customer_id}/${id}`);
        const data = await res.json();
        if (data.success) {
          setPurchaseStatus(data.data);
          setCanReview(data.data.can_review);
        }
      } catch (err) {
        console.error('Error checking purchase status:', err);
      }
    };
    checkPurchaseStatus();
  }, [currentUser, id]);

  const handleAddToCart = async () => {
    try {
      // Check if user is logged in
      if (!currentUser) {
        showAlert('warning', 'Login Required', 'Please log in to add items to cart');
        navigate('/login', { state: { from: `/product/${id}` } });
        return;
      }

      // Check stock availability
      if (product.stock === 0) {
        showAlert('error', 'Out of Stock', 'This product is currently out of stock');
        return;
      }

      if (product.stock < quantity) {
        showAlert('error', 'Insufficient Stock', `Only ${product.stock} items available`);
        return;
      }

      // Validate selections if options exist
      const requiresSize = product.sizes && product.sizes.length > 0;
      const requiresColor = product.colors && product.colors.length > 0;

      if (requiresSize && !selectedSize) {
        showAlert('warning', 'Size Required', 'Please select a size');
        return;
      }

      if (requiresColor && !selectedColor) {
        showAlert('warning', 'Color Required', 'Please select a color');
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

      // Track add to cart event
      trackingService.trackAddToCart(
        product.id, 
        quantity, 
        product.price, 
        currentUser?.id, 
        currentUser?.customer_id
      );
      
      // Show success notification
      setShowCartNotification(true);
      setTimeout(() => setShowCartNotification(false), 3000);

      // Trigger header badge refresh
      if (window.refreshHeaderBadges) {
        window.refreshHeaderBadges();
      }

    } catch (error) {
      showAlert('error', 'Error', error.message || 'Failed to add to cart');
    }
  };

  const handleAddToWishlist = async (productId) => {
    if (!currentUser?.id) {
      showAlert('warning', 'Login Required', 'Please log in to use wishlist');
      return;
    }
    try {
      // 1. Ensure wishlist exists
      const wishlist = await wishlistService.getOrCreateWishlist();
      // 2. Add product to wishlist using the service
      await wishlistService.addItemToWishlist(wishlist.id, productId);
      showAlert('success', 'Success', 'Added to wishlist!');
      
      // Trigger header badge refresh
      if (window.refreshHeaderBadges) {
        window.refreshHeaderBadges();
      }
    } catch (error) {
      showAlert('error', 'Error', 'Failed to add to wishlist');
    }
  };

  const handleCompare = () => {
    try {
      if (isInCompareList) {
        const result = CompareService.removeFromCompare(product.id);
        setIsInCompareList(false);
        showAlert(result.success ? 'success' : 'error', 
                 result.success ? 'Removed' : 'Error', 
                 result.message);
      } else {
        const result = CompareService.addToCompare(product.id);
        if (result.success) {
          setIsInCompareList(true);
        }
        showAlert(result.success ? 'success' : 'warning', 
                 result.success ? 'Added' : 'Cannot Add', 
                 result.message);
      }
      
      // Trigger header badge refresh
      if (window.refreshHeaderBadges) {
        window.refreshHeaderBadges();
      }
    } catch (error) {
      console.error('Error handling compare:', error);
      showAlert('error', 'Error', 'Failed to update comparison list');
    }
  };



  const handleReviewFormChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReviewRatingChange = (e, value) => {
    setReviewForm((prev) => ({ ...prev, rating: value }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?.id) {
      showAlert('warning', 'Login Required', 'Please log in to submit a review');
      return;
    }
    if (!reviewForm.rating) {
      showAlert('warning', 'Rating Required', 'Please select a rating');
      return;
    }
    try {
      const res = await fetch('${API_BASE_URL}/reviews/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: currentUser.customer_id,
          product_id: parseInt(id),
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        }),
      });
      if (res.ok) {
        setReviewForm({ rating: 0, comment: '' });
        showAlert('success', 'Review Submitted', 'Thank you for your feedback!');
        // Refresh reviews
        const data = await res.json();
        setHasReviewed(true);
        // Refetch reviews
        const reviewsRes = await fetch(`${API_BASE_URL}/reviews/product/${id}`);
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.reviews || []);
        setAverageRating(reviewsData.average_rating || 0);
        setTotalReviews(reviewsData.total || 0);
      } else {
        // Handle specific error messages from the backend
        const errorData = await res.json();
        let errorMessage = 'Failed to submit review';
        
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        // Show specific error messages for purchase verification
        if (errorMessage.includes('purchased')) {
          showAlert('warning', 'Purchase Required', errorMessage);
        } else if (errorMessage.includes('already reviewed')) {
          showAlert('info', 'Already Reviewed', errorMessage);
        } else {
          showAlert('error', 'Review Error', errorMessage);
        }
      }
    } catch (err) {
      showAlert('error', 'Error', 'Failed to submit review');
    }
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
        {/* Custom Alert */}
        <CustomAlert
          show={alert.show}
          severity={alert.severity}
          title={alert.title}
          message={alert.message}
          onClose={hideAlert}
          autoHideDuration={5000}
        />
        
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
                <SwiperSlide key={`${product.id}-image-${index}`}>
                  <div className="product-image-container h-full">
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg product-image-zoom"
                    />
                  </div>
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
                <SwiperSlide key={`${product.id}-thumb-${index}`}>
                  <div className="product-image-container h-full">
                    <img
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg cursor-pointer product-image-zoom"
                    />
                  </div>
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
                {product.discount > 0 && (
                  <>
                    <span className="text-lg text-gray-500 line-through">৳{product.price}</span>
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                      {Math.round(product.discount * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            <div>
              <p className="text-[#40513B] leading-relaxed">{product.description}</p>
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-[#40513B] mb-3">Size</h3>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
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
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-[#40513B] mb-3">Color</h3>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
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
                  ))}
                </div>
              </div>
            )}

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
                <span className={`text-sm ${product.stock > 0 ? 'text-[#40513B]' : 'text-red-500'}`}>
                  {product.stock > 0 ? `Available: ${product.stock}` : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <StyledButton
                variant="contained"
                startIcon={<MdOutlineShoppingCart />}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                sx={{ flex: 1 }}
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </StyledButton>
            </div>

            {/* Wishlist & Compare */}
            <div className="flex gap-4">
              <StyledButton onClick={() => handleAddToWishlist(product.id)}>
                Add to Wishlist
              </StyledButton>
              <button
                onClick={handleCompare}
                disabled={!isInCompareList && CompareService.isCompareListFull()}
                className={`flex items-center gap-2 px-4 py-2 border rounded-md transition-colors ${
                  isInCompareList 
                    ? 'border-red-500 bg-red-500 text-white' 
                    : CompareService.isCompareListFull()
                    ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'border-[#9DC08B] text-[#40513B] hover:bg-[#9DC08B] hover:text-white'
                }`}
                title={!isInCompareList && CompareService.isCompareListFull() 
                  ? `Compare list is full (${CompareService.MAX_COMPARE_ITEMS}/${CompareService.MAX_COMPARE_ITEMS}). Remove an item first.`
                  : ''
                }
              >
                <IoIosGitCompare />
                {isInCompareList ? 'Remove from Compare' : 'Compare'}
              </button>
            </div>
            
            {/* Show compare list status */}
            {!isInCompareList && (
              <div className="text-sm text-gray-600">
                Compare list: {CompareService.getCompareListCount()}/{CompareService.MAX_COMPARE_ITEMS} items
                {CompareService.isCompareListFull() && (
                  <span className="text-red-500 ml-2">(List is full)</span>
                )}
              </div>
            )}
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
                  {product.features && product.features.length > 0 ? (
                    product.features.map((feature, index) => (
                      <li key={`${product.id}-feature-${index}`}>{feature}</li>
                    ))
                  ) : (
                    <li>No features listed</li>
                  )}
                </ul>
              </div>
            )}

            {activeTab === 2 && (
              <div>
                <h3 className="text-xl font-semibold text-[#40513B] mb-4">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.specifications && Object.keys(product.specifications).length > 0 ? (
                    Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-[#40513B]">{key}</span>
                        <span className="text-[#40513B]">{value}</span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-[#40513B]">No specifications available</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div>
                <h3 className="text-xl font-semibold text-[#40513B] mb-4">Customer Reviews</h3>
                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <Rating value={averageRating} precision={0.1} readOnly />
                    <span className="text-[#40513B] font-medium">{averageRating.toFixed(1)} / 5</span>
                    <span className="text-gray-500">({totalReviews} reviews)</span>
                  </div>
                </div>
                {/* Review Form */}
                {currentUser && !hasReviewed && (
                  <div className="mb-8">
                    {purchaseStatus ? (
                      canReview ? (
                        <form onSubmit={handleReviewSubmit} className="bg-[#F6FFF2] p-4 rounded-lg shadow">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="font-medium text-[#40513B]">Your Rating:</span>
                            <Rating
                              name="rating"
                              value={reviewForm.rating}
                              onChange={handleReviewRatingChange}
                            />
                          </div>
                          <TextField
                            name="comment"
                            label="Your Review (optional)"
                            value={reviewForm.comment}
                            onChange={handleReviewFormChange}
                            multiline
                            minRows={2}
                            fullWidth
                            sx={{ mb: 2 }}
                          />
                          <Button type="submit" variant="contained" sx={{ backgroundColor: '#9DC08B', color: '#fff' }}>
                            Submit Review
                          </Button>
                        </form>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-yellow-800 font-medium">Review Not Available</span>
                          </div>
                          <p className="text-yellow-700 text-sm">
                            {!purchaseStatus.has_purchased 
                              ? "You can only review products you have purchased. Please complete a purchase before leaving a review."
                              : "You have already reviewed this product. You can only review each product once."
                            }
                          </p>
                        </div>
                      )
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="text-gray-600 text-sm">Checking review eligibility...</div>
                      </div>
                    )}
                  </div>
                )}
                {reviewLoading ? (
                  <div className="text-[#40513B]">Loading reviews...</div>
                ) : reviewError ? (
                  <div className="text-red-500">{reviewError}</div>
                ) : reviews.length === 0 ? (
                  <div className="text-[#40513B]">
                    No reviews yet. 
                    {currentUser && !hasReviewed && purchaseStatus?.has_purchased && canReview 
                      ? ' Be the first to review!' 
                      : currentUser && !hasReviewed && !purchaseStatus?.has_purchased
                      ? ' Purchase this product to leave a review!'
                      : ''
                    }
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-[#F6FFF2] p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Rating value={review.rating} readOnly size="small" />
                          <span className="text-[#40513B] font-medium">{review.rating} / 5</span>
                        </div>
                        <div className="flex-1 text-[#40513B]">{review.comment || <span className="italic text-gray-400">No comment</span>}</div>
                        <div className="text-xs text-gray-500 whitespace-nowrap">{new Date(review.review_date).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Product Recommendations Section */}
        <div className="mt-16 space-y-16">
          {/* Smart Recommendations - Only show if user is logged in */}
          {currentUser && (
            <div>
              <Recommendations 
                type="smart"
                currentProduct={product}
                title="You May Also Like"
                limit={4}
                className=""
              />
            </div>
          )}
          
          {/* Main Recommendations Grid */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#40513B] mb-3">Product Recommendations</h2>
              <p className="text-[#40513B] text-lg opacity-80">Discover more products you might love</p>
            </div>
            
            <div className="space-y-16">
              {/* Frequently Bought Together */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-[#9DC08B] rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#40513B]">Frequently Bought Together</h3>
                    <p className="text-sm text-[#40513B] opacity-70 mt-1">Products customers often buy together</p>
                  </div>
                </div>
                <Recommendations 
                  type="frequently-bought-together"
                  productId={id}
                  limit={4}
                  title=""
                  showViewAll={false}
                  className="bg-transparent"
                  displayMode="grid"
                />
              </div>
              
              {/* Similar Products */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-[#40513B] rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-[#40513B]">Similar Products</h3>
                </div>
                <Recommendations 
                  type="similar"
                  productId={id}
                  limit={4}
                  title=""
                  showViewAll={false}
                  className="bg-transparent"
                  displayMode="grid"
                />
              </div>
            </div>
          </div>
          
          {/* Additional Recommendations */}
          <div className="space-y-8">
            {/* Price Range Recommendations */}
            <div className="bg-gradient-to-br from-[#EDF6E5] to-[#F6FFF2] rounded-xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-[#9DC08B] rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[#40513B]">Similar Price Range</h3>
              </div>
              <Recommendations 
                type="price-range"
                productId={id}
                limit={4}
                title=""
                showViewAll={false}
                className="bg-transparent"
                displayMode="grid"
              />
            </div>
            
            {/* Category Recommendations */}
            <div className="bg-gradient-to-br from-[#F6FFF2] to-[#EDF6E5] rounded-xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-[#40513B] rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 1 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[#40513B]">More from This Category</h3>
              </div>
              <Recommendations 
                type="category"
                productId={id}
                limit={4}
                title=""
                showViewAll={false}
                className="bg-transparent"
                displayMode="grid"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 