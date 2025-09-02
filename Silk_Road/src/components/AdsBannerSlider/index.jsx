import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';


import { Navigation, Autoplay } from 'swiper/modules';

const AdsBannerSlider = (props) => {
    return (
        <div className="py-3">
            <Swiper
                slidesPerView={props.items}
                navigation={true}
                spaceBetween={10}
                autoplay={{ 
                    delay: 3000, 
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                    waitForTransition: true
                }}
                loop={true}
                modules={[Navigation, Autoplay]}
                className="mySwiper custom-swiper"
            >
                <SwiperSlide>
                    <div className='box'>
                        
                    </div>
                </SwiperSlide>
            </Swiper>
        </div>
    );
}
export default AdsBannerSlider;