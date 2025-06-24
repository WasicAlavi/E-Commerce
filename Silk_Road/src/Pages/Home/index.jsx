import React, { useState, useEffect } from 'react';
import HomeSlider from '../../components/HomeSlider';
import CategorySlider from '../../components/CategorySlider';
import 'swiper/css';
import 'swiper/css/navigation';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Navigation } from 'swiper/modules';
import ProductSlider from '../../components/ProductSlider';


const Home = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [value, setValue] = useState(0);


    useEffect(() => {
        fetch("http://localhost:8000/api/v1/products/tags/tree")
            .then(res => res.json())
            .then(data => setCategories(Array.isArray(data) ? data : []));
    }, []);


    useEffect(() => {
        if (categories.length === 0) return;
        const selectedCategory = categories[value];
        if (!selectedCategory) return;
        fetch(`http://localhost:8000/api/v1/products/card/by_tag/${selectedCategory.id}`)
            .then(res => res.json())
            .then(data => setProducts(Array.isArray(data) ? data : []));
    }, [categories, value]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <>
            <HomeSlider />
            <CategorySlider />

            <section className="bg-[#EDF6E5] py-8 font-montserrat">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="leftSection w-full md:w-2/5">
                            <h3 className="text-[30px] font-extrabold text-[#40513B]">
                                Popular Products
                            </h3>
                            <p className="text-lg font-medium text-[#40513B] mt-2">
                                Check out our most popular products
                            </p>
                        </div>
                        <div className="rightSection w-full md:w-3/5 flex justify-end">
                            <Box
                                sx={{
                                    maxWidth: { xs: '100%', sm: '100%' },
                                    '& .MuiTabs-indicator': {
                                        backgroundColor: '#9DC08B',
                                    },
                                    '& .MuiTab-root': {
                                        color: '#40513B',
                                        fontFamily: 'Montserrat, sans-serif',
                                        fontWeight: 500,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                    },
                                    '& .Mui-selected': {
                                        color: '#9DC08B !important',
                                    },
                                    '& .MuiTabs-scrollButtons': {
                                        color: '#40513B',
                                        '&.Mui-disabled': {
                                            opacity: 0.3,
                                        },
                                    },
                                }}
                            >
                                <Tabs
                                    value={value}
                                    onChange={handleChange}
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    aria-label="scrollable product category tabs"
                                >
                                    {categories.map((cat) => (
                                        <Tab key={cat.id} label={cat.name} />
                                    ))}
                                </Tabs>
                            </Box>
                        </div>
                    </div>

                    <ProductSlider items={5} title="Popular Products" products={products} />
                </div>
            </section>

            <section className="py-5 bg-white">
                <div className="container">
                    <div className="freeshipping flex items-center justify-between bg-[#9DC08B] text-white p-4 rounded-md">
                        <div className="flex items-center gap-3">
                            <img src="van.png" title="free icons" alt="" className="w-[70px]" />
                            <h1 className="text-[35px] font-bold">FREE SHIPPING</h1>
                        </div>
                        <p className="text-[28px] font-medium">
                            On all orders over <strong>৳3000</strong>
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home;