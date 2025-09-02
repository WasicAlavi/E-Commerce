import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import ProductCard from '../../components/ProductCard';

const Category = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryTitle, setCategoryTitle] = useState('');

  // Map frontend category names to backend tag IDs
  const categoryMapping = {
    // Main categories
    'Fashion': 46,
    'Electronics': 47,
    'Bags': 48,
    'Footwear': 49,
    'Groceries': 50,
    'Beauty': 51,
    'Wellness': 52,
    'Jewellery': 53,
    
    // Subcategories that map to their actual tag IDs
    'Smartphones': 65,
    'Laptops': 66,
    'Headphones': 67,
    'Smartwatches': 68,
    'Tablets': 69,
    'Shoes': 70,
    'Cameras': 71,
    'Drones': 72,
    'TVs': 73,
    'Gaming': 74,
    'Accessories': 75,
  };

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      try {
        const tagId = categoryMapping[categoryName];
        if (!tagId) {
          console.error('Category not found in mapping:', categoryName);
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:8000/api/v1/products/card/by_tag/${tagId}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
          setCategoryTitle(categoryName);
        } else {
          console.error('Failed to fetch category products');
        }
      } catch (error) {
        console.error('Error fetching category products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryName) {
      fetchCategoryProducts();
    }
  }, [categoryName]);

  if (loading) {
    return (
      <div className="bg-[#EDF6E5] min-h-screen py-8 font-montserrat">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-[#40513B] text-xl">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#EDF6E5] min-h-screen py-8 font-montserrat">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link to="/" className="text-[#40513B] hover:text-[#9DC08B]">
              <FaArrowLeft />
            </Link>
            <h1 className="text-3xl font-bold text-[#40513B]">{categoryTitle}</h1>
            <span className="text-[#9DC08B]">({products.length} products)</span>
          </div>
          <Link
            to="/all-products"
            className="text-[#9DC08B] hover:text-[#40513B] transition-colors duration-200 font-medium"
          >
            View All Products →
          </Link>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-[#40513B] mb-4">No Products Found</h2>
            <p className="text-[#40513B] mb-6">No products available in this category at the moment.</p>
            <Link to="/">
              <button className="bg-[#9DC08B] text-white px-6 py-2 rounded-md hover:bg-[#40513B] transition-colors">
                Continue Shopping
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Category; 