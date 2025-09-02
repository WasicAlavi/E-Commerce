import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import { FaFilter, FaSort } from 'react-icons/fa';
import { API_BASE_URL } from '../../config';


const AllProducts = () => {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPage] = useState(20);
    const [pageLoading, setPageLoading] = useState(false);

    // Separate state for pending filter changes
    const [pendingSortBy, setPendingSortBy] = useState('name');
    const [pendingSortOrder, setPendingSortOrder] = useState('asc');
    const [pendingPriceRange, setPendingPriceRange] = useState({ min: '', max: '' });

    // Handle URL parameters for "View All" buttons
    useEffect(() => {
        const urlSort = searchParams.get('sort');
        const urlOrder = searchParams.get('order');
        
        if (urlSort && urlOrder) {
            setSortBy(urlSort);
            setSortOrder(urlOrder);
            setPendingSortBy(urlSort);
            setPendingSortOrder(urlOrder);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchProducts();
    }, [currentPage, sortBy, sortOrder, priceRange]);

    const fetchProducts = async () => {
        setPageLoading(true);
        setError(null);
        
        try {
            let url = `${API_BASE_URL}/products/card?page=${currentPage}&per_page=${perPage}`;
            
            // Add sorting
            if (sortBy && sortOrder) {
                url += `&sort=${sortBy}&order=${sortOrder}`;
            }
            
            // Add price range
            if (priceRange.min) {
                url += `&min_price=${priceRange.min}`;
            }
            if (priceRange.max) {
                url += `&max_price=${priceRange.max}`;
            }
            
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setProducts(data.products || data);
                // Use the total count from the backend for proper pagination
                setTotalPages(Math.ceil(data.total / perPage) || 1);
            } else {
                throw new Error('Failed to fetch products');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setPageLoading(false);
        }
    };

    const handleSortChange = (e) => {
        const [field, order] = e.target.value.split('-');
        setPendingSortBy(field);
        setPendingSortOrder(order);
    };

    const handlePriceChange = (field, value) => {
        setPendingPriceRange(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const applyFilters = () => {
        setSortBy(pendingSortBy);
        setSortOrder(pendingSortOrder);
        setPriceRange(pendingPriceRange);
        setCurrentPage(1); 
    };

    const clearFilters = () => {
        setPendingSortBy('name');
        setPendingSortOrder('asc');
        setPendingPriceRange({ min: '', max: '' });
        setSortBy('name');
        setSortOrder('asc');
        setPriceRange({ min: '', max: '' });
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9DC08B]"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-[#40513B] mb-4">Error</h2>
                        <p className="text-gray-600">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#40513B] mb-2">
                        All Products
                    </h1>
                    <p className="text-gray-600">
                        Browse our complete collection of products
                    </p>
                </div>

                <div className="flex gap-6">
                    {/* Filters Sidebar */}
                    <div className="w-64 flex-shrink-0">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-[#40513B] flex items-center gap-2">
                                    <FaFilter />
                                    Filters
                                </h3>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="text-[#9DC08B] hover:text-[#40513B] transition-colors"
                                >
                                    {showFilters ? 'Hide' : 'Show'}
                                </button>
                            </div>

                            {showFilters && (
                                <div className="space-y-6">
                                    {/* Sort */}
                                    <div>
                                        <label className="block text-sm font-medium text-[#40513B] mb-2">
                                            Sort By
                                        </label>
                                        <select
                                            value={`${pendingSortBy}-${pendingSortOrder}`}
                                            onChange={handleSortChange}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9DC08B]"
                                        >
                                            <option value="name-asc">Name A-Z</option>
                                            <option value="name-desc">Name Z-A</option>
                                            <option value="price-asc">Price: Low to High</option>
                                            <option value="price-desc">Price: High to Low</option>
                                            <option value="rating-desc">Rating: High to Low</option>
                                        </select>
                                    </div>

                                    {/* Price Range */}
                                    <div>
                                        <label className="block text-sm font-medium text-[#40513B] mb-2">
                                            Price Range
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={pendingPriceRange.min}
                                                onChange={(e) => handlePriceChange('min', e.target.value)}
                                                className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9DC08B]"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={pendingPriceRange.max}
                                                onChange={(e) => handlePriceChange('max', e.target.value)}
                                                className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9DC08B]"
                                            />
                                        </div>
                                    </div>

                                    {/* Apply Filter Button */}
                                    <button
                                        onClick={applyFilters}
                                        className="w-full py-2 px-4 bg-[#9DC08B] text-white rounded-md hover:bg-[#8BB07A] transition-colors font-medium"
                                    >
                                        Apply Filter
                                    </button>

                                    {/* Clear Filters */}
                                    <button
                                        onClick={clearFilters}
                                        className="w-full py-2 px-4 bg-gray-200 text-[#40513B] rounded-md hover:bg-gray-300 transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results */}
                    <div className="flex-1 relative">
                        {products.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                                <h3 className="text-xl font-semibold text-[#40513B] mb-2">
                                    No products found
                                </h3>
                                <p className="text-gray-600">
                                    Try adjusting your filters
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Page Loading Overlay */}
                                {pageLoading && (
                                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9DC08B]"></div>
                                    </div>
                                )}
                                
                                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-opacity duration-300 ease-in-out ${pageLoading ? 'opacity-50' : 'opacity-100'}`}>
                                    {products.map((product) => (
                                        <div key={product.id} className="transition-all duration-300 ease-in-out transform hover:scale-105">
                                            <ProductCard product={product} />
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-8 flex justify-center">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1 || pageLoading}
                                                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 ease-in-out cursor-pointer"
                                            >
                                                Previous
                                            </button>
                                            
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    disabled={pageLoading}
                                                    className={`px-3 py-2 border rounded-md transition-all duration-200 ease-in-out cursor-pointer ${
                                                        currentPage === page
                                                            ? 'bg-[#9DC08B] text-white border-[#9DC08B] hover:bg-[#8BB07A] hover:border-[#8BB07A]'
                                                            : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm'
                                                    } ${pageLoading ? 'opacity-50' : ''}`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                            
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages || pageLoading}
                                                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 ease-in-out cursor-pointer"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllProducts; 