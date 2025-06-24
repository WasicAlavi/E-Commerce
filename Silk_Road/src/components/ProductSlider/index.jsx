import React from 'react';
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import Rating from '@mui/material/Rating';
import { FaRegHeart } from "react-icons/fa";
import { IoIosGitCompare } from "react-icons/io";
import { MdZoomOutMap } from "react-icons/md";
import ProductCard from '../ProductCard';
import 'swiper/css';
import 'swiper/css/navigation';







const ProductSlider = ({ items = 4, title, products = [] }) => {
    return (
        <div className="py-3">
            {title && (
                <h2 className="text-[26px] font-bold text-[#40513B] mb-4 font-montserrat">{title}</h2>
            )}
            <Swiper
                modules={[Navigation]}
                spaceBetween={20}
                slidesPerView={items}
                navigation
                breakpoints={{
                    320: { slidesPerView: 1 },
                    640: { slidesPerView: 2 },
                    768: { slidesPerView: 3 },
                    1024: { slidesPerView: items },
                }}
                className="mySwiper"
            >
                {products.length > 0 ? (
                    products.map((product) => (
                        <SwiperSlide key={product.id}>
                            <ProductCard product={product} />
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