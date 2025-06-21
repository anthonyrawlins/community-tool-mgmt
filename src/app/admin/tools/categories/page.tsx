'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { ApiClient } from '@/lib/api';
import { ToolCategory, CategoryForm } from '@/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ToolCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await ApiClient.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setError(error instanceof Error ? error.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryCreate = async (data: CategoryForm) => {
    setLoading(true);
    setError(null);

    try {
      await ApiClient.createCategory(data);
      await loadCategories();
      setSuccessMessage('Category created successfully');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error('Failed to create category:', error);
      setError(error instanceof Error ? error.message : 'Failed to create category');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryUpdate = async (id: string, data: CategoryForm) => {
    setLoading(true);
    setError(null);

    try {
      await ApiClient.updateCategory(id, data);
      await loadCategories();
      setSuccessMessage('Category updated successfully');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error('Failed to update category:', error);
      setError(error instanceof Error ? error.message : 'Failed to update category');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryDelete = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await ApiClient.deleteCategory(id);
      await loadCategories();
      setSuccessMessage('Category deleted successfully');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error('Failed to delete category:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete category');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const rootCategories = categories.filter(cat => !cat.parent);
  const subCategories = categories.filter(cat => cat.parent);
  const totalTools = categories.reduce((total, cat) => total + (cat._count?.tools || 0), 0);

  return (
    <AdminLayout title="Tool Categories">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tool Categories</h1>
          <p className="mt-2 text-gray-600">
            Organize your tool inventory with hierarchical categories and subcategories
          </p>
        </div>

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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Categories</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{categories.length}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Root Categories</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{rootCategories.length}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Subcategories</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{subCategories.length}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Tools</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{totalTools}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Category Manager */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <CategoryManager
            categories={categories}
            onCategoryCreate={handleCategoryCreate}
            onCategoryUpdate={handleCategoryUpdate}
            onCategoryDelete={handleCategoryDelete}
            loading={loading}
          />
        </div>

        {/* Tips and Best Practices */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">
            <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Category Organization Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Structure Guidelines:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Keep the hierarchy logical and intuitive</li>
                <li>Use broad categories at the root level</li>
                <li>Limit nesting to 2-3 levels maximum</li>
                <li>Group similar tools together</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Naming Best Practices:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Use clear, descriptive category names</li>
                <li>Avoid abbreviations or technical jargon</li>
                <li>Be consistent with naming conventions</li>
                <li>Consider how users will search for tools</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-100 rounded border border-blue-300">
            <p className="text-sm text-blue-900">
              <strong>Pro Tip:</strong> You can drag and drop categories to reorganize them. 
              Drop a category onto another to make it a subcategory, or drop it on the root zone to make it a top-level category.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}