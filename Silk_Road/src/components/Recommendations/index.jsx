import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Skeleton } from '@mui/material';
import { TrendingUp, LocalOffer, ShoppingCart, Whatshot } from '@mui/icons-material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { Link } from 'react-router-dom';
import recommendationService from '../../services/recommendationService';
import { useAuth } from '../../AuthContext';
import ProductCard from '../ProductCard';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Custom styles for Swiper
const swiperStyles = `
  .recommendations-swiper .swiper-button-next,
  .recommendations-swiper .swiper-button-prev {
    color: #40513B !important;
    background: white !important;
    width: 40px !important;
    height: 40px !important;
    border-radius: 50% !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    transition: all 0.2s ease !important;
  }
  
  .recommendations-swiper .swiper-button-next:hover,
  .recommendations-swiper .swiper-button-prev:hover {
    background: #9DC08B !important;
    color: white !important;
    transform: scale(1.05) !important;
  }
  
  .recommendations-swiper .swiper-button-next::after,
  .recommendations-swiper .swiper-button-prev::after {
    font-size: 16px !important;
    font-weight: bold !important;
  }
  
  .recommendations-swiper .swiper-pagination-bullet {
    background: #9DC08B !important;
    opacity: 0.5 !important;
    width: 10px !important;
    height: 10px !important;
    margin: 0 4px !important;
  }
  
  .recommendations-swiper .swiper-pagination-bullet-active {
    opacity: 1 !important;
    background: #40513B !important;
    transform: scale(1.2) !important;
  }
  
  .recommendations-swiper .swiper-slide {
    height: auto !important;
  }
`;

const Recommendations = ({ 
  type = 'general', 
  productId = null, 
  customerId = null, 
  limit = 8,
  title = null,
  showPrice = true,
  showDiscount = true,
  showViewAll = true,
  className = '',
  displayMode = 'swiper'
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        let data = [];
        
        switch (type) {
          case 'frequently-bought-together':
            if (productId) {
              data = await recommendationService.getFrequentlyBoughtTogether(productId, limit);
            }
            break;
          case 'similar':
            if (productId) {
              data = await recommendationService.getSimilarProducts(productId, limit);
            }
            break;
          case 'price-range':
            if (productId) {
              data = await recommendationService.getPriceRangeRecommendations(productId, limit);
            }
            break;
          case 'category':
            if (productId) {
              data = await recommendationService.getCategoryRecommendations(productId, limit);
            }
            break;
          case 'customer':
            if (customerId) {
              data = await recommendationService.getCustomerRecommendations(customerId, limit);
            } else if (user?.customer_id) {
              data = await recommendationService.getCustomerRecommendations(user.customer_id, limit);
            }
            break;
          case 'guest':
            data = await recommendationService.getGuestRecommendations(limit);
            break;
          case 'trending':
            data = await recommendationService.getTrendingProducts(limit);
            break;
          default:
            // Auto-detect based on user and context
            if (user?.customer_id) {
              data = await recommendationService.getCustomerRecommendations(user.customer_id, limit);
            } else {
              data = await recommendationService.getGuestRecommendations(limit);
            }
        }
        
        setRecommendations(data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [type, productId, customerId, limit, user]);

  const getTitle = () => {
    if (title === '') return null; // Return null for empty string
    if (title) return title;
    
    switch (type) {
      case 'frequently-bought-together':
        return 'Frequently Bought Together';
      case 'similar':
        return 'Similar Products';
      case 'customer':
        return 'Recommended for You';
      case 'guest':
        return 'Popular Products';
      case 'trending':
        return 'Trending Now';
      default:
        return user?.customer_id ? 'Recommended for You' : 'Popular Products';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'frequently-bought-together':
        return <ShoppingCart sx={{ mr: 1, color: '#40513B' }} />;
      case 'similar':
        return <TrendingUp sx={{ mr: 1, color: '#40513B' }} />;
      case 'trending':
        return <Whatshot sx={{ mr: 1, color: '#40513B' }} />;
      default:
        return <LocalOffer sx={{ mr: 1, color: '#40513B' }} />;
    }
  };

  if (loading) {
    return (
      <section className={`${className?.includes('bg-transparent') ? 'bg-transparent' : 'bg-[#EDF6E5]'} py-8 font-montserrat`}>
        <div className="container mx-auto px-4">
          {getTitle() && (
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                {getIcon()}
                <Typography variant="h5" fontWeight="bold" color="#40513B">
                  {getTitle()}
                </Typography>
              </div>
            </div>
          )}
          {displayMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(limit)].map((_, index) => (
                <div key={index} className="space-y-3">
                  <div className="bg-gray-200 rounded-lg h-48 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <Grid container spacing={3}>
              {[...Array(limit)].map((_, index) => (
                <Grid xs={12} sm={6} md={4} lg={3} key={index}>
                  <Skeleton variant="rectangular" height={300} />
                  <Skeleton variant="text" height={24} sx={{ mt: 1 }} />
                  <Skeleton variant="text" height={20} width="60%" />
                </Grid>
              ))}
            </Grid>
          )}
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-lg mb-2">No recommendations available</div>
        <div className="text-gray-300 text-sm">Try browsing our other products</div>
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-200 mt-2">
            Type: {type}, Product ID: {productId}
          </div>
        )}
      </div>
    );
  }

  return (
    <section className={`${className?.includes('bg-transparent') ? 'bg-transparent' : 'bg-[#EDF6E5]'} py-8 font-montserrat ${className || ''}`}>
      <style dangerouslySetInnerHTML={{ __html: swiperStyles }} />
      <div className="container mx-auto px-4">
        {getTitle() && (
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              {getIcon()}
              <Typography variant="h5" fontWeight="bold" color="#40513B">
                {getTitle()}
              </Typography>
            </div>
            {showViewAll && recommendations.length > 0 && (
              <Link
                to="/all-products"
                className="text-[#9DC08B] hover:text-[#40513B] transition-colors duration-200 font-medium"
              >
                View All →
              </Link>
            )}
          </div>
        )}
        
                  {displayMode === 'grid' ? (
            // Grid layout similar to main page
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
              {recommendations.map((product) => (
                <div key={product.id} className="transition-all duration-300 ease-in-out transform hover:scale-105">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
          // Swiper layout (default)
          <div className="relative">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={1}
              navigation={true}
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 20,
                },
                1280: {
                  slidesPerView: 5,
                  spaceBetween: 20,
                },
              }}
              className="recommendations-swiper"
              style={{
                paddingBottom: '40px', // Space for pagination
              }}
            >
              {recommendations.map((product, index) => (
                <SwiperSlide key={`${type}-${product.id}-${index}`}>
                  <div className="h-full">
                    <ProductCard product={product} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    </section>
  );
};

export default Recommendations; 