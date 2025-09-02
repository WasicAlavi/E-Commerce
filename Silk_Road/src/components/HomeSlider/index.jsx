import React from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';


import { Navigation, Autoplay } from 'swiper/modules';



const HomeSlider = () => {
    return (
        <div className="py-3">
            <Swiper
                navigation={true}
                spaceBetween={30}
                autoplay={{ delay: 2000, disableOnInteraction: false }}
                loop={true}
                modules={[Navigation, Autoplay]}
                className="mySwiper custom-swiper"
            >
                <SwiperSlide>
                    <img src="61lwJy4B8PL._SX3000_.jpg" alt="Slide 1" className="w-full h-[300px] object-top object-cover" />
                </SwiperSlide>
                <SwiperSlide>
                    <img src="61zAjw4bqPL._SX3000_.jpg" alt="Slide 2" className="w-full h-[300px] object-top object-cover" />
                </SwiperSlide>
                <SwiperSlide>
                    <img src="71h15GsHkvL._SX3000_.jpg" alt="Slide 3" className="w-full h-[300px] object-top object-cover" />
                </SwiperSlide>
                <SwiperSlide>
                    <img src="71Ie3JXGfVL._SX3000_.jpg" alt="Slide 4" className="w-full h-[300px] object-top object-cover" />
                </SwiperSlide>
                <SwiperSlide>
                    <img src="81KkrQWEHIL._SX3000_.jpg" alt="Slide 5" className="w-full h-[300px] object-top object-cover" />
                </SwiperSlide>
            </Swiper>
        </div>
    );
}
export default HomeSlider;
