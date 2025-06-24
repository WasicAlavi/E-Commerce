import React from 'react';
import { Link } from 'react-router-dom';
import Rating from '@mui/material/Rating';
import { FaRegHeart } from "react-icons/fa";
import { IoIosGitCompare } from "react-icons/io";
import { MdZoomOutMap } from "react-icons/md";

const ProductCard = ({ product }) => {

    const handleWishlist = () => {
        console.log(`Added to wishlist: ${product.name}`);
    };

    const handleCompare = () => {
        console.log(`Added to compare: ${product.name}`);
    };

    const handleZoom = () => {
        console.log(`Zoom/View: ${product.name}`);
    };

    // Only show discount badge if there's actually a discount
    const showDiscount = product.discount > 0;

    return (
        <div className="product-card bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow relative">
            {showDiscount && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                    {product.discount * 100}% OFF
                </div>
            )}

            <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
                <button onClick={handleWishlist} className="bg-white text-[#40513B] p-2 rounded-full shadow hover:bg-[#9DC08B] hover:text-white transition-colors text-lg">
                    <FaRegHeart />
                </button>
                <button onClick={handleCompare} className="bg-white text-[#40513B] p-2 rounded-full shadow hover:bg-[#9DC08B] hover:text-white transition-colors text-lg">
                    <IoIosGitCompare />
                </button>
                <button onClick={handleZoom} className="bg-white text-[#40513B] p-2 rounded-full shadow hover:bg-[#9DC08B] hover:text-white transition-colors text-lg">
                    <MdZoomOutMap />
                </button>
            </div>

            <Link to={`/product/${product.id}`} className="link transition-all">
                <img
                    src={product.image || "https://via.placeholder.com/300x300?text=No+Image"}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-md"
                />
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
            <button className="mt-3 w-full bg-[#9DC08B] text-white py-2 rounded-md hover:bg-[#40513B] transition-colors font-montserrat">
                Add to Cart
            </button>
        </div>
    );
};

export default ProductCard;
