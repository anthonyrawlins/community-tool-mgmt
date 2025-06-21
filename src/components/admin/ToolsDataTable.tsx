'use client';

import React, { useState, useMemo } from 'react';
import { Tool, ToolCategory, ToolFilters, TableSort } from '@/types';

interface ToolsDataTableProps {
  tools: Tool[];
  categories: ToolCategory[];
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: ToolFilters;
  sort: TableSort | null;
  selectedTools: string[];
  onPageChange: (page: number) => void;
  onSort: (sort: TableSort) => void;
  onFilter: (filters: ToolFilters) => void;
  onSelectionChange: (selectedIds: string[]) => void;
  onRefresh: () => void;
}

export function ToolsDataTable({
  tools,
  categories,
  loading,
  pagination,
  filters,
  sort,
  selectedTools,
  onPageChange,
  onSort,
  onFilter,
  onSelectionChange,
  onRefresh
}: ToolsDataTableProps) {
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);

  const getStatusBadge = (status: string) => {
    const configs = {
      'AVAILABLE': { 
        bg: 'bg-green-100', 
        text: 'text-green-800', 
        icon: '✓',
        label: 'Available' 
      },
      'ON_LOAN': { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800', 
        icon: '📤',
        label: 'On Loan' 
      },
      'MAINTENANCE': { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-800', 
        icon: '🔧',
        label: 'Maintenance' 
      },
      'LOST': { 
        bg: 'bg-red-100', 
        text: 'text-red-800', 
        icon: '❌',
        label: 'Lost' 
      },
      'RETIRED': { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800', 
        icon: '🚫',
        label: 'Retired' 
      }
    };
    
    const config = configs[status as keyof typeof configs] || configs.AVAILABLE;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getConditionBadge = (condition: string) => {
    const configs = {
      'EXCELLENT': { 
        bg: 'bg-green-100', 
        text: 'text-green-800', 
        icon: '⭐',
        label: 'Excellent' 
      },
      'GOOD': { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800', 
        icon: '👍',
        label: 'Good' 
      },
      'FAIR': { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-800', 
        icon: '⚠️',
        label: 'Fair' 
      },
      'NEEDS_REPAIR': { 
        bg: 'bg-red-100', 
        text: 'text-red-800', 
        icon: '🔨',
        label: 'Needs Repair' 
      }
    };
    
    const config = configs[condition as keyof typeof configs] || configs.GOOD;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter({ ...filters, search: localSearch });
  };

  const handleSort = (field: string) => {
    const newOrder = sort?.field === field && sort.order === 'asc' ? 'desc' : 'asc';
    onSort({ field, order: newOrder });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(tools.map(tool => tool.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectTool = (toolId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedTools, toolId]);
    } else {
      onSelectionChange(selectedTools.filter(id => id !== toolId));
    }
  };

  const isAllSelected = tools.length > 0 && selectedTools.length === tools.length;
  const isIndeterminate = selectedTools.length > 0 && selectedTools.length < tools.length;

  const getSortIcon = (field: string) => {
    if (sort?.field !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sort.order === 'asc' ? (
      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Tools</h3>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="text-gray-500">Loading tools...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      {/* Header with Search and Filters */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">Tools</h3>
            <p className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} tools
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="flex flex-1 lg:flex-initial">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="Search tools..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
              <button
                type="submit"
                className="ml-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Search
              </button>
            </form>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
              Filters
            </button>

            {/* Refresh */}
            <button
              onClick={onRefresh}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => onFilter({ ...filters, status: e.target.value as any })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="ON_LOAN">On Loan</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="LOST">Lost</option>
                  <option value="RETIRED">Retired</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select
                  value={filters.condition || ''}
                  onChange={(e) => onFilter({ ...filters, condition: e.target.value as any })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm"
                >
                  <option value="">All Conditions</option>
                  <option value="EXCELLENT">Excellent</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="NEEDS_REPAIR">Needs Repair</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.categoryId || ''}
                  onChange={(e) => onFilter({ ...filters, categoryId: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <select
                  value={filters.available === undefined ? '' : filters.available.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    onFilter({
                      ...filters,
                      available: value === '' ? undefined : value === 'true'
                    });
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm"
                >
                  <option value="">All Tools</option>
                  <option value="true">Available Only</option>
                  <option value="false">Unavailable Only</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => onFilter({})}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={input => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
              </th>
              
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Tool Name
                  {getSortIcon('name')}
                </div>
              </th>
              
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center">
                  Category
                  {getSortIcon('category')}
                </div>
              </th>
              
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {getSortIcon('status')}
                </div>
              </th>
              
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('condition')}
              >
                <div className="flex items-center">
                  Condition
                  {getSortIcon('condition')}
                </div>
              </th>
              
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Barcode
              </th>
              
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {tools.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-lg font-medium text-gray-900 mb-2">No tools found</p>
                    <p className="text-gray-500 mb-4">
                      {Object.keys(filters).length > 0 
                        ? "Try adjusting your search or filters" 
                        : "Get started by adding your first tool"
                      }
                    </p>
                    {Object.keys(filters).length === 0 && (
                      <a
                        href="/admin/tools/new"
                        className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Your First Tool
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              tools.map((tool) => (
                <tr key={tool.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedTools.includes(tool.id)}
                      onChange={(e) => handleSelectTool(tool.id, e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {tool.imageUrl && (
                        <img 
                          src={tool.imageUrl} 
                          alt={tool.name}
                          className="h-12 w-12 rounded-lg object-cover mr-4 border border-gray-200"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tool.name}</div>
                        {(tool.brand || tool.model) && (
                          <div className="text-sm text-gray-500">
                            {tool.brand} {tool.model}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {tool.category?.name || (
                      <span className="text-gray-400 italic">Uncategorized</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4">
                    {getStatusBadge(tool.status)}
                  </td>
                  
                  <td className="px-6 py-4">
                    {getConditionBadge(tool.condition)}
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {tool.location || (
                      <span className="text-gray-400 italic">Not specified</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {tool.barcode || (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <a
                        href={`/admin/tools/${tool.id}/edit`}
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        Edit
                      </a>
                      <a
                        href={`/catalog/${tool.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        View
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {pagination.page} of {pagination.pages}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const page = i + Math.max(1, pagination.page - 2);
                return page <= pagination.pages ? (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary ${
                      page === pagination.page
                        ? 'bg-primary text-white border-primary'
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ) : null;
              })}
              
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}