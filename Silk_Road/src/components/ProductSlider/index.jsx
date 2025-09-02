import React from 'react';
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import Rating from '@mui/material/Rating';
import { FaRegHeart } from "react-icons/fa";
import { IoIosGitCompare } from "react-icons/io";
import { MdZoomOutMap } from "react-icons/md";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ProductCard from '../ProductCard';
import 'swiper/css';
import 'swiper/css/navigation';

const ProductSlider = ({ items = 4, title, products = [], showViewAll = true, viewAllLink = null }) => {
    // Create unique navigation button classes based on title
    const sliderId = title ? title.toLowerCase().replace(/\s+/g, '-') : 'default';
    const prevButtonClass = `swiper-button-prev-${sliderId}`;
    const nextButtonClass = `swiper-button-next-${sliderId}`;

    // Generate appropriate "View All" link based on title
    const getViewAllLink = () => {
        if (viewAllLink) return viewAllLink;
        
        switch (title?.toLowerCase()) {
            case 'popular products':
                return '/all-products?sort=views&order=desc';
            case 'biggest discounts':
                return '/all-products?sort=discount&order=desc';
            case 'best sellers':
                return '/all-products?sort=purchase_count&order=desc';
            case 'new arrivals':
                return '/all-products?sort=created_at&order=desc';
            default:
                return '/all-products';
        }
    };

    return (
        <div className="py-3 relative">
            {title && (
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-[26px] font-bold text-[#40513B] font-montserrat">{title}</h2>
                    {showViewAll && products.length > 0 && (
                        <Link
                            to={getViewAllLink()}
                            className="text-[#9DC08B] hover:text-[#40513B] transition-colors duration-200 font-medium"
                        >
                            View All →
                        </Link>
                    )}
                </div>
            )}
            
            {/* Custom Navigation Buttons */}
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 z-10">
                <button className={`${prevButtonClass} bg-white border border-gray-200 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-gray-50 hover:border-[#9DC08B] transition-all duration-200 ease-in-out hover:shadow-xl active:scale-95`}>
                    <FaChevronLeft className="text-[#40513B] text-lg" />
                </button>
            </div>
            
            <div className="absolute top-1/2 right-0 transform -translate-y-1/2 z-10">
                <button className={`${nextButtonClass} bg-white border border-gray-200 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-gray-50 hover:border-[#9DC08B] transition-all duration-200 ease-in-out hover:shadow-xl active:scale-95`}>
                    <FaChevronRight className="text-[#40513B] text-lg" />
                </button>
            </div>
            
            <Swiper
                modules={[Navigation]}
                spaceBetween={30}
                slidesPerView={items}
                navigation={{
                    nextEl: `.${nextButtonClass}`,
                    prevEl: `.${prevButtonClass}`,
                }}
                breakpoints={{
                    320: { slidesPerView: 1, spaceBetween: 20 },
                    640: { slidesPerView: 2, spaceBetween: 25 },
                    768: { slidesPerView: 3, spaceBetween: 30 },
                    1024: { slidesPerView: items, spaceBetween: 30 },
                }}
                className="mySwiper px-16" // Add padding to make room for custom buttons
                style={{
                    '--swiper-navigation-size': '0px', // Hide default navigation
                }}
            >
                {products.length > 0 ? (
                    products.map((product) => (
                        <SwiperSlide key={product.id}>
                            <div className="p-2"> {/* Add padding around each product card */}
                                <ProductCard product={product} />
                            </div>
                        </SwiperSlide>
                    ))
                ) : (
                    <SwiperSlide>
                        <div className="text-center py-10 text-[#40513B] font-montserrat">
                            No products available in this category.
                        </div>
                    </SwiperSlide>
                )}
            </Swiper>
        </div>
    );
};

export default ProductSlider;