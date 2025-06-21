'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ToolsDataTable } from '@/components/admin/ToolsDataTable';
import { BulkActions } from '@/components/admin/BulkActions';
import { ApiClient } from '@/lib/api';
import { Tool, ToolFilters, TableSort, BulkAction, ToolCategory } from '@/types';

export default function AdminToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<ToolCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState<ToolFilters>({});
  const [sort, setSort] = useState<TableSort | null>(null);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadTools();
  }, [pagination.page, filters, sort]);

  useEffect(() => {
    setShowBulkActions(selectedTools.length > 0);
  }, [selectedTools]);

  const loadInitialData = async () => {
    await Promise.all([loadTools(), loadCategories()]);
  };

  const loadTools = async () => {
    try {
      setLoading(true);
      const response = await ApiClient.getTools(filters, pagination.page, pagination.limit);
      setTools(response.data.tools);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages
      }));
    } catch (error) {
      console.error('Failed to load tools:', error);
      setError(error instanceof Error ? error.message : 'Failed to load tools');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await ApiClient.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleSort = (newSort: TableSort) => {
    setSort(newSort);
  };

  const handleFilter = (newFilters: ToolFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedTools(selectedIds);
  };

  const handleBulkAction = async (action: BulkAction) => {
    try {
      await ApiClient.bulkUpdateTools(action);
      await loadTools();
      setSelectedTools([]);
      setSuccessMessage(`${action.action} completed successfully for ${action.selectedIds.length} tools`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error('Bulk action failed:', error);
      setError(error instanceof Error ? error.message : 'Bulk action failed');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await ApiClient.exportTools('csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tools-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccessMessage('Tools exported successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setError(error instanceof Error ? error.message : 'Export failed');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleImportSuccess = () => {
    loadTools();
    setSuccessMessage('Tools imported successfully');
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const statsData = {
    available: tools.filter(t => t.status === 'AVAILABLE').length,
    onLoan: tools.filter(t => t.status === 'ON_LOAN').length,
    maintenance: tools.filter(t => t.status === 'MAINTENANCE').length,
    total: pagination.total
  };

  return (
    <AdminLayout title="Tool Inventory">
      <div className="space-y-6">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tool Inventory</h1>
            <p className="text-gray-600 mt-1">Manage your tool library inventory with advanced filtering and bulk operations</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            <a
              href="/admin/tools/import"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary text-center transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Import Tools
            </a>
            <a
              href="/admin/tools/categories"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary text-center transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Categories
            </a>
            <a
              href="/admin/tools/new"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary text-center transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Tool
            </a>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Available</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{statsData.available}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">On Loan</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{statsData.onLoan}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Maintenance</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{statsData.maintenance}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Tools</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{statsData.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <BulkActions
            selectedCount={selectedTools.length}
            onBulkAction={handleBulkAction}
            onClearSelection={() => setSelectedTools([])}
          />
        )}

        {/* Advanced Tools Data Table */}
        <ToolsDataTable
          tools={tools}
          categories={categories}
          loading={loading}
          pagination={pagination}
          filters={filters}
          sort={sort}
          selectedTools={selectedTools}
          onPageChange={handlePageChange}
          onSort={handleSort}
          onFilter={handleFilter}
          onSelectionChange={handleSelectionChange}
          onRefresh={loadTools}
        />
      </div>
    </AdminLayout>
  );
}