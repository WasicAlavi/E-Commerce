import React, { useState, useEffect, useRef } from 'react';
import { IoSearch } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import { FaTimes } from "react-icons/fa";
import { API_BASE_URL } from '../../config';


const Search = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchRef = useRef(null);
    const suggestionsRef = useRef(null);
    const navigate = useNavigate();

    // Debounce search query
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery.trim().length >= 2) {
                fetchSuggestions(searchQuery.trim());
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSuggestions = async (query) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}&limit=8`);
            if (response.ok) {
                const data = await response.json();
                setSuggestions(data);
                setShowSuggestions(data.length > 0);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        setSelectedIndex(-1);
    };

    const handleKeyDown = (e) => {
        if (suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => 
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                    handleSuggestionClick(suggestions[selectedIndex]);
                } else {
                    handleSearch();
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setSelectedIndex(-1);
                break;
        }
    };

    const handleSuggestionClick = (product) => {
        setSearchQuery(product.name);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        navigate(`/product/${product.id}`);
    };

    const handleSearch = () => {
        if (searchQuery.trim()) {
            setShowSuggestions(false);
            setSelectedIndex(-1);
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedIndex(-1);
    };

    const formatPrice = (price, discount = 0) => {
        const finalPrice = price * (1 - discount);
        return `৳${finalPrice.toFixed(2)}`;
    };

    return (
        <div className="searchBox w-full h-[50px] bg-[#EDF6E5] rounded-md px-8 flex items-center justify-between relative" ref={searchRef}>
            <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Search for products....."
                className="w-3/4 h-full bg-inherit focus:outline-none text-[18px] placeholder:opacity-50 placeholder:text-[#40513B] placeholder:italic"
            />
            
            {searchQuery && (
                <button
                    onClick={clearSearch}
                    className="absolute right-16 text-[#40513B] hover:text-[#9DC08B] transition-colors"
                >
                    <FaTimes size={16} />
                </button>
            )}
            
            <button onClick={handleSearch}>
                <IoSearch className="text-[#40513B] text-2xl hover:text-[#9DC08B] hover:scale-110 transition duration-300 cursor-pointer" />
            </button>

            {/* Search Suggestions */}
            {showSuggestions && (
                <div 
                    className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto"
                    ref={suggestionsRef}
                >
                    {isLoading ? (
                        <div className="p-4 text-center text-[#40513B]">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#9DC08B] mx-auto"></div>
                            <p className="mt-2">Searching...</p>
                        </div>
                    ) : suggestions.length > 0 ? (
                        <div>
                            {suggestions.map((product, index) => (
                                <div
                                    key={product.id}
                                    className={`p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                                        index === selectedIndex ? 'bg-[#EDF6E5]' : ''
                                    }`}
                                    onClick={() => handleSuggestionClick(product)}
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={product.image || "https://via.placeholder.com/40x40?text=No+Image"}
                                            alt={product.name}
                                            className="w-10 h-10 object-cover rounded"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-[#40513B] truncate">
                                                {product.name}
                                            </h4>
                                            <p className="text-xs text-[#9DC08B] font-semibold">
                                                {formatPrice(product.price, product.discount || 0)}
                                            </p>
                                        </div>
                                        {product.discount > 0 && (
                                            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                                                {Math.round(product.discount * 100)}% OFF
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div className="p-3 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={handleSearch}
                                    className="w-full text-center text-sm text-[#40513B] hover:text-[#9DC08B] font-medium"
                                >
                                    View all results for "{searchQuery}"
                                </button>
                            </div>
                        </div>
                    ) : searchQuery.trim().length >= 2 ? (
                        <div className="p-4 text-center text-[#40513B]">
                            <p>No products found for "{searchQuery}"</p>
                            <p className="text-sm text-gray-500 mt-1">Try different keywords</p>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default Search;