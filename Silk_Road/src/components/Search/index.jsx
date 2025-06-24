import React from 'react';
import { IoSearch } from "react-icons/io5";



const Search = () => {
    return (
      <div className="searchBox w-full h-[50px] bg-[#EDF6E5] rounded-md px-8 flex items-center justify-between">
        <input
          type="text"
          placeholder="Search for products....."
          className="w-3/4 h-full bg-inherit focus:outline-none text-[18px] placeholder:opacity-50 placeholder:text-[#40513B] placeholder:italic"
        />
        <button><IoSearch className="text-[#40513B] text-2xl hover:text-[#9DC08B] hover:scale-110 transition duration-300 cursor-pointer" /></button>
      </div>
    );
  };
export default Search;