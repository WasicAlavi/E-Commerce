import React from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Link } from "react-router-dom";
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';



const CategorySlider = () => {
    return (
        <div className="homeCategorySlider py-3 overflow-visible relative">
            <div className="container overflow-visible">
                <Swiper
                    slidesPerView={6}
                    spaceBetween={30}
                    navigation={true}
                    loop={true}
                    modules={[Navigation]}
                    className="mySwiper custom-swiper"
                >
                    <SwiperSlide className="py-4">
                        <Link to="/">
                            <div
                                className="item p-4 bg-white hover:bg-[#d0f1b9] text-[#40513B] hover:text-[#2a3c24] transition-all duration-300 rounded-md text-center shadow-lg hover:scale-105 flex items-center justify-center flex-col gap-3 font-montserrat"
                                aria-label="Fashion category card"
                            >
                                <img
                                    src="item1.png"
                                    alt="Fashion category"
                                    className="w-[60px] h-[60px] object-cover hover:scale-110 transition-transform duration-300"
                                />
                                <h3 className="text-lg font-medium">Fashion</h3>
                            </div>
                        </Link>
                    </SwiperSlide>
                    <SwiperSlide className="py-4">
                        <Link to="/">
                            <div
                                className="item p-4 bg-white hover:bg-[#d0f1b9] text-[#40513B] hover:text-[#2a3c24] transition-all duration-300 rounded-md text-center shadow-lg hover:scale-105 flex items-center justify-center flex-col gap-3 font-montserrat"
                                aria-label="Electronics category card"
                            >
                                <img
                                    src="item8.png"
                                    alt="Electronics category"
                                    className="w-[60px] h-[60px] object-cover hover:scale-110 transition-transform duration-300"
                                />
                                <h3 className="text-lg font-medium">Electronics</h3>
                            </div>
                        </Link>
                    </SwiperSlide>
                    <SwiperSlide className="py-4">
                        <Link to="/">
                            <div
                                className="item p-4 bg-white hover:bg-[#d0f1b9] text-[#40513B] hover:text-[#2a3c24] transition-all duration-300 rounded-md text-center shadow-lg hover:scale-105 flex items-center justify-center flex-col gap-3 font-montserrat"
                                aria-label="Bags category card"
                            >
                                <img
                                    src="item2.png"
                                    alt="Bags category"
                                    className="w-[60px] h-[60px] object-cover hover:scale-110 transition-transform duration-300"
                                />
                                <h3 className="text-lg font-medium">Bags</h3>
                            </div>
                        </Link>
                    </SwiperSlide>
                    <SwiperSlide className="py-4">
                        <Link to="/">
                            <div
                                className="item p-4 bg-white hover:bg-[#d0f1b9] text-[#40513B] hover:text-[#2a3c24] transition-all duration-300 rounded-md text-center shadow-lg hover:scale-105 flex items-center justify-center flex-col gap-3 font-montserrat"
                                aria-label="Footwear category card"
                            >
                                <img
                                    src="item3.png"
                                    alt="Footwear category"
                                    className="w-[60px] h-[60px] object-cover hover:scale-110 transition-transform duration-300"
                                />
                                <h3 className="text-lg font-medium">Footwear</h3>
                            </div>
                        </Link>
                    </SwiperSlide>
                    <SwiperSlide className="py-4">
                        <Link to="/">
                            <div
                                className="item p-4 bg-white hover:bg-[#d0f1b9] text-[#40513B] hover:text-[#2a3c24] transition-all duration-300 rounded-md text-center shadow-lg hover:scale-105 flex items-center justify-center flex-col gap-3 font-montserrat"
                                aria-label="Groceries category card"
                            >
                                <img
                                    src="item4.png"
                                    alt="Groceries category"
                                    className="w-[60px] h-[60px] object-cover hover:scale-110 transition-transform duration-300"
                                />
                                <h3 className="text-lg font-medium">Groceries</h3>
                            </div>
                        </Link>
                    </SwiperSlide>
                    <SwiperSlide className="py-4">
                        <Link to="/">
                            <div
                                className="item p-4 bg-white hover:bg-[#d0f1b9] text-[#40513B] hover:text-[#2a3c24] transition-all duration-300 rounded-md text-center shadow-lg hover:scale-105 flex items-center justify-center flex-col gap-3 font-montserrat"
                                aria-label="Beauty category card"
                            >
                                <img
                                    src="item5.png"
                                    alt="Beauty category"
                                    className="w-[60px] h-[60px] object-cover hover:scale-110 transition-transform duration-300"
                                />
                                <h3 className="text-lg font-medium">Beauty</h3>
                            </div>
                        </Link>
                    </SwiperSlide>
                    <SwiperSlide className="py-4">
                        <Link to="/">
                            <div
                                className="item p-4 bg-white hover:bg-[#d0f1b9] text-[#40513B] hover:text-[#2a3c24] transition-all duration-300 rounded-md text-center shadow-lg hover:scale-105 flex items-center justify-center flex-col gap-3 font-montserrat"
                                aria-label="Wellness category card"
                            >
                                <img
                                    src="item6.png"
                                    alt="Wellness category"
                                    className="w-[60px] h-[60px] object-cover hover:scale-110 transition-transform duration-300"
                                />
                                <h3 className="text-lg font-medium">Wellness</h3>
                            </div>
                        </Link>
                    </SwiperSlide>
                    <SwiperSlide className="py-4">
                        <Link to="/">
                            <div
                                className="item p-4 bg-white hover:bg-[#d0f1b9] text-[#40513B] hover:text-[#2a3c24] transition-all duration-300 rounded-md text-center shadow-lg hover:scale-105 flex items-center justify-center flex-col gap-3 font-montserrat"
                                aria-label="Jewellery category card"
                            >
                                <img
                                    src="item7.png"
                                    alt="Jewellery category"
                                    className="w-[60px] h-[60px] object-cover hover:scale-110 transition-transform duration-300"
                                />
                                <h3 className="text-lg font-medium">Jewellery</h3>
                            </div>
                        </Link>
                    </SwiperSlide>

                </Swiper>
            </div>
        </div>

    );
}
export default CategorySlider;