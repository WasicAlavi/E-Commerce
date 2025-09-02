import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { RiCloseFill } from "react-icons/ri";
import { CiSquarePlus } from "react-icons/ci";
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../config';


const CategoryPanel = ({ open, openFunc }) => {
    const navigate = useNavigate();
    const [openCategory, setOpenCategory] = React.useState(null);
    const [expandedSubcategory, setExpandedSubcategory] = React.useState(null);
    const [categories, setCategories] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    // Map backend category names to frontend category names
    const categoryNameMapping = {
        // Main categories
        'Fashion': 'Fashion',
        'Electronics': 'Electronics',
        'Bags': 'Bags',
        'Footwear': 'Footwear',
        'Groceries': 'Groceries',
        'Beauty': 'Beauty',
        'Wellness': 'Wellness',
        'Jewellery': 'Jewellery',
        
        // Subcategories - map to their actual names for proper navigation
        'Smartphones': 'Smartphones',
        'Laptops': 'Laptops',
        'Headphones': 'Headphones',
        'Smartwatches': 'Smartwatches',
        'Tablets': 'Tablets',
        'Shoes': 'Shoes',
        'Cameras': 'Cameras',
        'Drones': 'Drones',
        'TVs': 'TVs',
        'Gaming': 'Gaming',
        'Accessories': 'Accessories'
    };

    const handleCategoryClick = (categoryId, categoryName) => {
        setOpenCategory((prev) => (prev === categoryId ? null : categoryId));
        setExpandedSubcategory(null);
    };

    const handleSubcategoryClick = (subId, subName) => {
        setExpandedSubcategory((prev) => (prev === subId ? null : subId));
    };

    const navigateToCategory = (categoryName) => {
        const mappedName = categoryNameMapping[categoryName] || categoryName;
        navigate(`/category/${mappedName}`);
        openFunc(); // Close the panel
    };

    const navigateToSubcategory = (subName) => {
        const mappedName = categoryNameMapping[subName] || subName;
        navigate(`/category/${mappedName}`);
        openFunc(); // Close the panel
    };

    const navigateToChildCategory = (childName) => {
        const mappedName = categoryNameMapping[childName] || childName;
        navigate(`/category/${mappedName}`);
        openFunc(); // Close the panel
    };

    React.useEffect(() => {
        fetch(`${API_BASE_URL}/products/tags/tree`)
            .then(res => res.json())
            .then(data => {
                setCategories(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));

    const DrawerList = (
        <Box sx={{ width: 250, bgcolor: '#f6fdef' }} role="presentation" className="font-montserrat ">
            <div className="flex items-center justify-between p-5 bg-[#EDF6E5] text-[#40513B]">
                <h3 className="text-[18px] font-semibold">All Categories</h3>
                <button
                    onClick={openFunc}
                    aria-label="Close category panel"
                    className="text-[#40513B] hover:text-[#2e3f2c] transition duration-300 hover:cursor-pointer"
                >
                    <RiCloseFill className="text-3xl" />
                </button>
            </div>
            <List className="overflow-y-auto max-h-[calc(100vh-80px)] p-2">
                {loading ? (
                    <div className="p-4">Loading...</div>
                ) : (
                    sortedCategories.map(category => (
                        <ListItem disablePadding className="flex flex-col items-start w-full" key={category.id}>
                            <ListItemButton
                                className="w-full text-[#40513B] hover:bg-[#d4e6c8] transition duration-300 rounded-md"
                                aria-label={`Expand ${category.name} category`}
                                onClick={() => handleCategoryClick(category.id, category.name)}
                            >
                                <ListItemText
                                    primary={
                                        <span 
                                            className="pl-3 text-lg font-semibold cursor-pointer hover:text-[#9DC08B]"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigateToCategory(category.name);
                                            }}
                                        >
                                            {category.name}
                                        </span>
                                    }
                                />
                                {category.children && category.children.length > 0 && (
                                    <CiSquarePlus className="text-3xl text-[#40513B] ml-auto" />
                                )}
                            </ListItemButton>
                            {openCategory === category.id && category.children && category.children.length > 0 && (
                                <ul className="w-full pl-8 py-2 space-y-2 text-[#40513B]">
                                    {category.children.map(sub => (
                                        <li key={sub.id}>
                                            <div
                                                onClick={() => handleSubcategoryClick(sub.id, sub.name)}
                                                className="cursor-pointer hover:underline flex justify-between items-center text-base"
                                            >
                                                <span 
                                                    className='text-[17px] cursor-pointer hover:text-[#9DC08B]'
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigateToSubcategory(sub.name);
                                                    }}
                                                >
                                                    {sub.name}
                                                </span>
                                            </div>
                                            {expandedSubcategory === sub.id && sub.children && sub.children.length > 0 && (
                                                <ul className="pl-4 mt-2 space-y-1 text-[17px]">
                                                    {sub.children.map(child => (
                                                        <li 
                                                            key={child.id} 
                                                            className="hover:underline cursor-pointer hover:text-[#9DC08B]"
                                                            onClick={() => navigateToChildCategory(child.name)}
                                                        >
                                                            {child.name}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </ListItem>
                    ))
                )}
            </List>
        </Box >
    );

    return (
        <Drawer
            anchor="left"
            open={open}
            onClose={openFunc}
            slotProps={{
                paper: {
                    sx: { backgroundColor: '#f6fdef' },
                },
            }}
        >
            {DrawerList}
        </Drawer>
    );
};

export default CategoryPanel;