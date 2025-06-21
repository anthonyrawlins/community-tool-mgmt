'use client';

import React, { useState } from 'react';
import { TableFilters, TableSort, BulkAction } from '@/types';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: unknown, item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onPageChange?: (page: number) => void;
  onSort?: (sort: TableSort) => void;
  onFilter?: (filters: TableFilters) => void;
  onBulkAction?: (action: BulkAction) => void;
  bulkActions?: Array<{
    label: string;
    value: string;
    icon?: string;
  }>;
  searchable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  rowId?: keyof T;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  pagination,
  onPageChange,
  onSort,
  onFilter,
  onBulkAction,
  bulkActions = [],
  searchable = true,
  selectable = false,
  rowId = 'id' as keyof T,
  emptyMessage = 'No data available'
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentSort, setCurrentSort] = useState<TableSort | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (field: string) => {
    if (!onSort) return;
    
    const newSort: TableSort = {
      field,
      order: currentSort?.field === field && currentSort.order === 'asc' ? 'desc' : 'asc'
    };
    
    setCurrentSort(newSort);
    onSort(newSort);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(data.map(item => String(item[rowId]))));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
  };

  const handleBulkAction = (action: string) => {
    if (!onBulkAction || selectedRows.size === 0) return;
    
    onBulkAction({
      action,
      selectedIds: Array.from(selectedRows)
    });
    
    setSelectedRows(new Set());
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onFilter) {
      onFilter({ ...filters, search: searchTerm });
    }
  };

  const getSortIcon = (field: string) => {
    if (currentSort?.field !== field) return '↕️';
    return currentSort.order === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      {/* Header with search and actions */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {searchable && (
            <form onSubmit={handleSearch} className="flex-1 max-w-sm">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
            </form>
          )}

          {selectable && selectedRows.size > 0 && bulkActions.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedRows.size} selected
              </span>
              <select
                onChange={(e) => e.target.value && handleBulkAction(e.target.value)}
                value=""
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Bulk Actions</option>
                {bulkActions.map((action) => (
                  <option key={action.value} value={action.value}>
                    {action.icon} {action.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === data.length && data.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.sortable && (
                      <span className="text-gray-400">{getSortIcon(String(column.key))}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  {selectable && <td className="px-6 py-4"><div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div></td>}
                  {columns.map((column) => (
                    <td key={String(column.key)} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-12 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const id = String(item[rowId]);
                return (
                  <tr key={id} className="hover:bg-gray-50">
                    {selectable && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(id)}
                          onChange={(e) => handleSelectRow(id, e.target.checked)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {column.render 
                          ? column.render(item[column.key as keyof T], item)
                          : String(item[column.key as keyof T] || '')
                        }
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && onPageChange && (
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {((pagination.page - 1) * pagination.limit) + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.total}</span>{' '}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  ←
                </button>
                
                {Array.from({ length: Math.min(5, pagination.pages) }).map((_, index) => {
                  const pageNum = pagination.page - 2 + index;
                  if (pageNum < 1 || pageNum > pagination.pages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === pagination.page
                          ? 'z-10 bg-primary border-primary text-white'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  →
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}