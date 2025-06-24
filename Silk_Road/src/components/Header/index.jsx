import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Search from "../Search";
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { MdOutlineShoppingCart } from "react-icons/md";
import { IoIosGitCompare } from "react-icons/io";
import { FiHeart } from "react-icons/fi";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import Tooltip from '@mui/material/Tooltip';
import Navigation from "./Navigation";
import { useAuth } from '../../AuthContext';
import authService from '../../services/authService.js';


const StyledBadge = styled(Badge) (({ theme }) => ({
    '& .MuiBadge-badge': {
        right: -3,
        top: 13,
        border: `1px solid ${(theme.vars ?? theme).palette.background.paper}`,
        padding: '0 4px',
        backgroundColor: '#015D10',
        color: '#fff',
    },
}));

const Header = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const { isLoggedIn, currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        authService.logout();
        logout(); // Update context state
        handleProfileMenuClose();
        navigate('/');
    };

    return (
        <header>
            <div className="top-strip py-2">
                <div className="container">
                    <div className="flex items-center justify-between">
                        <div className="col1 w-[50%]">
                            <p className="text-[15px] text-[#40513B] font-[500]">
                                Get up to 40% off new season styles
                            </p>
                        </div>

                        <div className="col2 flex items-center justify-end">
                            <ul className="flex items-center gap-5">
                                <li className="list-none text-[#40513B]">
                                    <Link to="/help-center" className="text-[18px] link font-[500]">Help Center</Link>
                                </li>

                                <li className="list-none text-[#40513B]">
                                    <Link to="/order-tracking" className="text-[18px] link font-[500]">Order Tracking</Link>
                                </li>

                            </ul>
                        </div>

                    </div>
                </div>
            </div>

            <div className="header py-4 border-b-[1px] border-t-[1px] border-[#9DC08B] " >
                <div className="container flex items-center justify-between">
                    <div className="col1 w-[25%]">
                        <Link to="/"><img src="/logo3.jpg" className="w-[220px]" alt="Logo" /></Link>
                    </div>
                    <div className="col2 w-[45%]">
                        <Search />
                    </div>

                    <div className="col3 w-[30%] pl-10">
                        <ul className="flex items-center gap-3 w-full justify-end">
                            {isLoggedIn ? (
                                <li className="list-none">
                                    <Tooltip title={`Profile - ${currentUser?.username || 'User'}`} arrow>
                                        <IconButton onClick={handleProfileMenuOpen}>
                                            <FaUser size={24} color="#40513B"/>
                                        </IconButton>
                                    </Tooltip>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={handleProfileMenuClose}
                                        sx={{
                                            '& .MuiMenuItem-root': {
                                                fontFamily: 'Montserrat, sans-serif',
                                                color: '#40513B',
                                                '&:hover': {
                                                    backgroundColor: '#f0f9ff',
                                                    color: '#9DC08B',
                                                },
                                            },
                                        }}
                                    >
                                        <MenuItem onClick={handleProfileMenuClose} component={Link} to="/profile">
                                            My Profile
                                        </MenuItem>
                                        <MenuItem onClick={handleProfileMenuClose} component={Link} to="/order-tracking">
                                            My Orders
                                        </MenuItem>
                                        <MenuItem onClick={handleLogout}>
                                            <FaSignOutAlt className="mr-2" />
                                            Logout
                                        </MenuItem>
                                    </Menu>
                                </li>
                            ) : (
                                <li className="list-none">
                                    <Link to="/login" className="text-[#40513B] text-[18px] font-[500] link">Login</Link> | <Link to="/register" className="text-[#40513B] text-[18px] font-[500] link">Register</Link>
                                </li>
                            )}

                            <li>
                                <Tooltip title="Compare Products" arrow>
                                    <Link to="/compare">
                                        <IconButton aria-label="compare">
                                            <StyledBadge badgeContent={3}>
                                                <IoIosGitCompare size={28} color="#40513B"/>
                                            </StyledBadge>
                                        </IconButton>
                                    </Link>
                                </Tooltip>
                            </li>

                            <li>
                                <Tooltip title="Wishlist" arrow>
                                    <Link to="/wishlist">
                                        <IconButton aria-label="wishlist">
                                            <StyledBadge badgeContent={4}>
                                                <FiHeart size={28} color="#40513B"/>
                                            </StyledBadge>
                                        </IconButton>
                                    </Link>
                                </Tooltip>
                            </li>

                            <li>
                                <Tooltip title="Shopping Cart" arrow>
                                    <Link to="/cart">
                                        <IconButton aria-label="cart">
                                            <StyledBadge badgeContent={4}>
                                                <MdOutlineShoppingCart size={28} color="#40513B"/>
                                            </StyledBadge>
                                        </IconButton>
                                    </Link>
                                </Tooltip>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>

            <Navigation />

        </header>
    );
}
export default Header;