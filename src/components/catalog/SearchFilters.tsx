'use client';

import { useState, useEffect } from 'react';
import { ToolCategory, ToolFilters, ToolStatus, ToolCondition } from '@/types';

interface SearchFiltersProps {
  categories: ToolCategory[];
  filters: ToolFilters;
  onFiltersChange: (filters: Partial<ToolFilters>) => void;
  onClear: () => void;
}

export const SearchFilters = ({ categories, filters, onFiltersChange, onClear }: SearchFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ search: searchTerm || undefined });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, onFiltersChange]);

  const handleFilterChange = (key: keyof ToolFilters, value: string) => {
    onFiltersChange({
      [key]: value || undefined,
    });
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="bg-gray-50 p-6 rounded-lg mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Find the Right Tool</h2>
        {activeFiltersCount > 0 && (
          <button
            onClick={onClear}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear All ({activeFiltersCount})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Tools
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter tool name, brand, or keyword..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            id="category"
            value={filters.categoryId || ''}
            onChange={(e) => handleFilterChange('categoryId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} {category._count?.tools ? `(${category._count.tools})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_LOAN">On Loan</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="LOST">Lost</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>

        {/* Condition Filter */}
        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
            Condition
          </label>
          <select
            id="condition"
            value={filters.condition || ''}
            onChange={(e) => handleFilterChange('condition', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Conditions</option>
            <option value="EXCELLENT">Excellent</option>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
            <option value="NEEDS_REPAIR">Needs Repair</option>
          </select>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => onFiltersChange({ available: !filters.available })}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filters.available
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
          }`}
        >
          Available Only
        </button>
      </div>
    </div>
  );
};