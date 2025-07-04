// src/components/Courses/SearchAndFilters.jsx
import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

export default function SearchAndFilters({ searchTerm, setSearchTerm, sortBy, setSortBy }) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-6">
      {/* Search Box */}
      <div className="relative flex-1 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition" />
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white text-black shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>

      {/* Sort Dropdown */}
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="appearance-none w-full lg:w-auto px-4 py-3 pr-10 rounded-xl bg-white text-black border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
        >
          <option value="popular">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
      </div>
    </div>
  );
}