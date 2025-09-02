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
import ProductCard from '../../components/ProductCard';
import Recommendations from '../../components/Recommendations';
import { Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import trackingService from '../../services/trackingService';
import { API_BASE_URL } from '../../config';



const Home = () => {
    const { user, isLoggedIn, token } = useAuth();
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [value, setValue] = useState(0);
    const [discountProducts, setDiscountProducts] = useState([]);
    const [couponProducts, setCouponProducts] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [categoryProducts, setCategoryProducts] = useState({});
    const [forYouProducts, setForYouProducts] = useState([]);
    const [forYouLoading, setForYouLoading] = useState(false);


    useEffect(() => {
        fetch(`${API_BASE_URL}/products/tags/tree`)
            .then(res => res.json())
            .then(data => setCategories(Array.isArray(data) ? data : []));
        
        // Track home page view
        trackingService.trackPageView('/', user?.id, user?.customer_id);
    }, [user]);


    useEffect(() => {
        if (categories.length === 0) return;
        const selectedCategory = categories[value];
        if (!selectedCategory) return;
        fetch(`${API_BASE_URL}/products/card/by_tag/${selectedCategory.id}`)
            .then(res => res.json())
            .then(data => setProducts(Array.isArray(data) ? data : []));
    }, [categories, value]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/products/card/highest-discounts?limit=8`)
            .then(res => res.json())
            .then(data => setDiscountProducts(Array.isArray(data) ? data : []));
    }, []);

    useEffect(() => {
        fetch(`${API_BASE_URL}/products/card/with-coupons?limit=8`)
            .then(res => res.json())
            .then(data => setCouponProducts(Array.isArray(data) ? data : []));
    }, []);

    useEffect(() => {
        fetch(`${API_BASE_URL}/products/card/best-sellers?limit=8`)
            .then(res => res.json())
            .then(data => setBestSellers(Array.isArray(data) ? data : []));
    }, []);

    useEffect(() => {
        if (categories.length > 0) {
            // Fetch products for ALL categories, not just the first three
            categories.forEach(category => {
                if (category && category.id) {
                    fetch(`${API_BASE_URL}/products/card/by_tag/${category.id}?limit=6`)
                        .then(res => {
                            if (!res.ok) {
                                throw new Error(`HTTP error! status: ${res.status}`);
                            }
                            return res.json();
                        })
                        .then(data => {
                            setCategoryProducts(prev => ({
                                ...prev,
                                [category.id]: Array.isArray(data) ? data : []
                            }));
                        })
                        .catch(error => {
                            console.error(`Error fetching products for category ${category.name} (ID: ${category.id}):`, error);
                            setCategoryProducts(prev => ({
                                ...prev,
                                [category.id]: []
                            }));
                        });
                }
            });
        }
    }, [categories]);

    // Fetch personalized recommendations
    useEffect(() => {
        const fetchForYou = async () => {
            if (!isLoggedIn || !user?.customer_id) return;
            setForYouLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/products/for_you/${user.customer_id}`);
                if (res.ok) {
                    const data = await res.json();
                    setForYouProducts(Array.isArray(data) ? data : []);
                } else {
                    setForYouProducts([]);
                }
            } catch (err) {
                setForYouProducts([]);
            } finally {
                setForYouLoading(false);
            }
        };
        fetchForYou();
    }, [isLoggedIn, user]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <>
            <HomeSlider />
            <CategorySlider />

            {/* For You Section */}
            {isLoggedIn && user?.customer_id && (
                <Recommendations 
                    type="customer"
                    customerId={user.customer_id}
                    title="Recommended for You"
                    limit={12}
                />
            )}

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
                            <img src="/van.png" title="free icons" alt="" className="w-[70px]" />
                            <h1 className="text-[35px] font-bold">FREE SHIPPING</h1>
                        </div>
                        <p className="text-[28px] font-medium">
                            On all orders over <strong>৳3000</strong>
                        </p>
                    </div>
                </div>
            </section>

            {/* New Product Sections */}
            <section className="bg-[#EDF6E5] py-8 font-montserrat">
                <div className="container mx-auto px-4">
                    <ProductSlider items={5} title="Biggest Discounts" products={discountProducts} />
                </div>
            </section>

            {/* Trending Now Section */}
            <Recommendations 
                type="trending"
                title="Trending Now"
                limit={12}
            />

            {/* Category Product Sections */}
            {categories.map((category) => (
                <section key={category.id} className="bg-white py-8 font-montserrat">
                    <div className="container mx-auto px-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-[26px] font-bold text-[#40513B]">{category.name}</h2>
                            <Link
                                to={`/category/${category.name}`}
                                className="text-[#9DC08B] hover:text-[#40513B] transition-colors duration-200"
                            >
                                View All →
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {(categoryProducts[category.id]?.slice(0, 5) || []).map((product) => (
                                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                                    <ProductCard product={{ ...product, image: product.image || '/default-product.png' }} />
                                </div>
                            ))}
                        </div>

                        {(!categoryProducts[category.id] || categoryProducts[category.id].length === 0) && (
                            <div className="text-center py-10 text-[#40513B]">
                                No products available in this category.
                            </div>
                        )}
                    </div>
                </section>
            ))}

            <section className="bg-white py-8 font-montserrat">
                <div className="container mx-auto px-4">
                    <ProductSlider items={5} title="Best Sellers" products={bestSellers} />
                </div>
            </section>
        </>
    );
};

export default Home;