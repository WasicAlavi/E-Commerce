import React from "react";
import { HiMenuAlt2 } from "react-icons/hi";
import { IoIosArrowDown } from "react-icons/io";
import { Link } from "react-router-dom";
import CategoryPanel from "./CategoryPanel";

const Navigation = () => {

    const [open, setOpen] = React.useState(false);
    
    const openCaregoryPanel = () => {
        setOpen(!open);
    }



    return (
        <>
            <nav className="bg-[#EDF6E5] py-3 shadow-md">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <div className="col1 w-[60%]">
                        <button className="flex items-center gap-3 text-[18px] text-[#40513B] font-medium bg-transparent hover:bg-[#9DC08B] hover:text-white transition duration-300 px-5 py-2 rounded-md cursor-pointer" onClick={openCaregoryPanel}>
                            <HiMenuAlt2 className="text-2xl" />
                            All Categories
                            <IoIosArrowDown className="text-2xl" />
                        </button>
                    </div>
                    <div className="col2 w-[40%]">
                        <ul className="flex items-center gap-6 w-full justify-end">
                            <li className="list-none text-[#40513B]">
                                <Link to="/all-products" className="text-[18px] link font-[500] link ">All Products</Link>
                            </li>
                            <li className="list-none text-[#40513B]">
                                <Link to="/help-center" className="text-[18px] link font-[500] link ">Help Center</Link>
                            </li>
                            <li className="list-none text-[#40513B]">
                                <Link to="/order-tracking" className="text-[18px] link font-[500] link ">Order Tracking</Link>
                            </li>
                        </ul>

                    </div>
                </div>
            </nav>
            {/* sideabar */} 
            <CategoryPanel openFunc={openCaregoryPanel} open={open}/>
        </>
    );
};

export default Navigation;