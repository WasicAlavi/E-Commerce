import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import { FaFilter, FaSort, FaSearch } from 'react-icons/fa';
import { API_BASE_URL } from '../../config';


const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('relevance');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [showFilters, setShowFilters] = useState(false);
    
    const query = searchParams.get('q') || '';

    useEffect(() => {
        if (query) {
            fetchSearchResults();
        }
    }, [query, sortBy, priceRange]);

    const fetchSearchResults = async () => {
        setLoading(true);
        setError(null);
        
        try {
            let url = `${API_BASE_URL}/products/card?search=${encodeURIComponent(query)}`;
            
            // Add sorting
            if (sortBy === 'price_low') {
                url += '&sort=price&order=asc';
            } else if (sortBy === 'price_high') {
                url += '&sort=price&order=desc';
            } else if (sortBy === 'name') {
                url += '&sort=name&order=asc';
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
            } else {
                throw new Error('Failed to fetch search results');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    const handlePriceChange = (field, value) => {
        setPriceRange(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const clearFilters = () => {
        setSortBy('relevance');
        setPriceRange({ min: '', max: '' });
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
                    <div className="flex items-center gap-3 mb-4">
                        <FaSearch className="text-[#9DC08B] text-xl" />
                        <h1 className="text-3xl font-bold text-[#40513B]">
                            Search Results
                        </h1>
                    </div>
                    <p className="text-gray-600">
                        {products.length} results found for "{query}"
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
                                            value={sortBy}
                                            onChange={handleSortChange}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9DC08B]"
                                        >
                                            <option value="relevance">Relevance</option>
                                            <option value="name">Name A-Z</option>
                                            <option value="price_low">Price: Low to High</option>
                                            <option value="price_high">Price: High to Low</option>
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
                                                value={priceRange.min}
                                                onChange={(e) => handlePriceChange('min', e.target.value)}
                                                className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9DC08B]"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={priceRange.max}
                                                onChange={(e) => handlePriceChange('max', e.target.value)}
                                                className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9DC08B]"
                                            />
                                        </div>
                                    </div>

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
                    <div className="flex-1">
                        {products.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                                <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-[#40513B] mb-2">
                                    No products found
                                </h3>
                                <p className="text-gray-600">
                                    Try adjusting your search terms or filters
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchResults; 