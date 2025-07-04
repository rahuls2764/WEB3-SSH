// src/components/Courses/Sidebar.jsx
import React from 'react';
import { Filter } from 'lucide-react';

export default function Sidebar({ categories, selectedCategory, setSelectedCategory }) {
  return (
    <aside className="lg:w-64">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 sticky top-28 transition-all">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
          <Filter size={18} className="mr-2 text-indigo-500" />
          Categories
        </h3>

        <div className="space-y-2">
          {categories.map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedCategory(id)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition group ${
                selectedCategory === id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${selectedCategory === id ? 'text-white' : 'text-indigo-500 group-hover:text-indigo-700'}`} />
              <span className="text-sm font-medium">{name}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
