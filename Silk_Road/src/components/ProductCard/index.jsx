import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Rating from '@mui/material/Rating';
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { IoIosGitCompare } from "react-icons/io";
import { MdZoomOutMap } from "react-icons/md";
import { useAuth } from '../../AuthContext';
import wishlistService from '../../services/wishlistService';
import cartService from '../../services/cartService';
import compareService from '../../services/compareService';
import trackingService from '../../services/trackingService';
import ReactDOM from 'react-dom';
import { API_BASE_URL } from '../../config';


const ProductCard = ({ product }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isInCompareList, setIsInCompareList] = useState(false);
    const [showZoomModal, setShowZoomModal] = useState(false);

    // Check if product is in wishlist on component mount
    useEffect(() => {
        const checkWishlistStatus = async () => {
            if (!user?.id) return;
            
            try {
                const wishlist = await wishlistService.getOrCreateWishlist();
                // Check if product exists in wishlist
                const response = await fetch(`${API_BASE_URL}/wishlists/${wishlist.id}/items/check/${product.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setIsWishlisted(data.data.exists);
                }
            } catch (error) {
                console.error('Error checking wishlist status:', error);
            }
        };

        checkWishlistStatus();
    }, [user, product.id]);

    // Check if product is in compare list on component mount
    useEffect(() => {
        setIsInCompareList(compareService.isInCompareList(product.id));
    }, [product.id]);

    // Listen for compare list updates
    useEffect(() => {
        const handleCompareUpdate = () => {
            setIsInCompareList(compareService.isInCompareList(product.id));
        };

        window.addEventListener('compareUpdated', handleCompareUpdate);
        return () => window.removeEventListener('compareUpdated', handleCompareUpdate);
    }, [product.id]);

    const handleWishlist = async () => {
        if (!user?.id) {
            alert('Please log in to use wishlist');
            return;
        }

        if (isLoading) return;
        setIsLoading(true);

        try {
            const wishlist = await wishlistService.getOrCreateWishlist();
            
            if (isWishlisted) {
                // Remove from wishlist
                await wishlistService.removeItemFromWishlist(wishlist.id, product.id);
                setIsWishlisted(false);
                alert('Removed from wishlist!');
            } else {
                // Add to wishlist
                await wishlistService.addItemToWishlist(wishlist.id, product.id);
                setIsWishlisted(true);
                alert('Added to wishlist!');
            }
            
            // Trigger badge count refresh
            if (window.refreshHeaderBadges) {
                window.refreshHeaderBadges();
            }
        } catch (err) {
            console.error('Wishlist error:', err);
            alert('Failed to update wishlist');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!user?.customer_id) {
            alert('Please log in to add items to cart');
            return;
        }

        if (isAddingToCart) return;
        
        // Track product click
        trackingService.trackProductView(
            product.id,
            product.name,
            user?.id,
            user?.customer_id
        );
        setIsAddingToCart(true);

        try {
            // Get or create cart
            const cart = await cartService.getOrCreateCart();
            
            // Add item to cart (quantity 1, no options for now)
            await cartService.addItemToCart(cart.id, product.id, 1);
            
            alert('Added to cart!');
            
            // Trigger badge count refresh
            if (window.refreshHeaderBadges) {
                window.refreshHeaderBadges();
            }
        } catch (err) {
            console.error('Error adding to cart:', err);
            alert('Failed to add to cart');
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleCompare = () => {
        if (isInCompareList) {
            // Remove from compare list
            const result = compareService.removeFromCompare(product.id);
            alert(result.message);
        } else {
            // Add to compare list
            const result = compareService.addToCompare(product.id);
            alert(result.message);
            
            // If successfully added and list is full, offer to go to compare page
            if (result.success && compareService.isCompareListFull()) {
                const goToCompare = confirm('Compare list is full! Would you like to go to the compare page now?');
                if (goToCompare) {
                    navigate('/compare');
                }
            }
        }
    };

    const handleZoom = () => {
        setShowZoomModal(true);
    };

    const closeZoomModal = () => {
        setShowZoomModal(false);
    };

    // Only show discount badge if there's actually a discount
    const showDiscount = product.discount > 0;

    // Render modal using portal for global overlay
    const zoomModal = showZoomModal ? ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 transition-all duration-300"
            onClick={closeZoomModal}
        >
            <div
                className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-3xl scale-95 opacity-0 animate-zoomIn relative transition-all duration-300"
                style={{ animation: 'zoomIn 0.25s cubic-bezier(0.4,0,0.2,1) forwards' }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={closeZoomModal}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
                    aria-label="Close"
                >
                    ×
                </button>
                <img
                    src={product.image || 'https://via.placeholder.com/400x400?text=No+Image'}
                    alt={product.name}
                    className="w-full h-56 object-cover rounded-lg mb-4"
                />
                <h4 className="text-lg font-semibold text-[#40513B] mb-1">{product.name}</h4>
                <p className="text-gray-600 text-sm mb-2 line-clamp-3">{product.description}</p>
                {showDiscount ? (
                    <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm text-gray-400 line-through">৳{product.price}</p>
                        <p className="text-lg font-bold text-[#9DC08B]">
                            ৳{Math.round(product.price * (1 - product.discount))}
                        </p>
                    </div>
                ) : (
                    <p className="text-lg font-bold text-[#9DC08B] mb-2">৳{product.price}</p>
                )}
                <Rating
                    name="size-medium"
                    value={product.rating || 0}
                    size="medium"
                    readOnly
                    className="mb-2"
                />
                <div className="flex gap-2 mt-2">
                    <button
                        onClick={handleAddToCart}
                        disabled={isAddingToCart}
                        className={`flex-1 py-2 rounded-md transition-colors font-montserrat ${
                            isAddingToCart
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-[#9DC08B] text-white hover:bg-[#40513B]'
                        }`}
                    >
                        {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                    </button>
                    <Link
                        to={`/product/${product.id}`}
                        className="flex-1 py-2 px-4 rounded-md bg-[#9DC08B] text-white hover:bg-[#40513B] transition-colors font-montserrat text-center"
                        onClick={closeZoomModal}
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <>
            <div className="product-card bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow relative">
                {showDiscount && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                        {product.discount * 100}% OFF
                    </div>
                )}

                <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
                    <button 
                        onClick={handleWishlist} 
                        disabled={isLoading}
                        className={`bg-white text-[#40513B] p-2 rounded-full shadow transition-colors text-lg ${
                            isLoading 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:bg-[#9DC08B] hover:text-white'
                        }`}
                    >
                        {isWishlisted ? <FaHeart /> : <FaRegHeart />}
                    </button>
                    <button 
                        onClick={handleCompare} 
                        className={`bg-white text-[#40513B] p-2 rounded-full shadow transition-colors text-lg ${
                            isInCompareList 
                                ? 'bg-[#9DC08B] hover:text-white' 
                                : 'hover:bg-[#9DC08B] hover:text-white'
                        }`}
                    >
                        <IoIosGitCompare />
                    </button>
                    <button onClick={handleZoom} className="bg-white text-[#40513B] p-2 rounded-full shadow hover:bg-[#9DC08B] hover:text-white transition-colors text-lg">
                        <MdZoomOutMap />
                    </button>
                </div>

                <Link to={`/product/${product.id}`} className="link transition-all">
                    <div className="product-image-container">
                        <img
                            src={product.image || "https://via.placeholder.com/300x300?text=No+Image"}
                            alt={product.name}
                            className="w-full h-48 object-cover rounded-md product-image-zoom"
                        />
                    </div>
                    <h4 className="text-lg font-semibold text-[#40513B] mt-3 font-montserrat">
                        {product.name}
                    </h4>

                    {showDiscount ? (
                        <div className="flex items-center gap-2 mt-1 font-montserrat">
                            <p className="text-sm text-gray-400 line-through">৳{product.price}</p>
                            <p className="text-base font-medium text-[#9DC08B]">
                                ৳{Math.round(product.price * (1 - product.discount))}
                            </p>
                        </div>
                    ) : (
                        <p className="text-base font-medium text-[#9DC08B] mt-1 font-montserrat">
                            ৳{product.price}
                        </p>
                    )}
                </Link>

                <Rating
                    name="size-small"
                    value={product.rating || 0}
                    size="small"
                    readOnly
                />
                <button 
                    className={`mt-3 w-full py-2 rounded-md transition-colors font-montserrat ${
                        isAddingToCart 
                            ? 'bg-gray-400 text-white cursor-not-allowed' 
                            : 'bg-[#9DC08B] text-white hover:bg-[#40513B]'
                    }`} 
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                >
                    {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
            </div>
            {zoomModal}
        </>
    );
};

export default ProductCard;


