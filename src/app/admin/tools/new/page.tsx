'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ToolForm } from '@/components/admin/ToolForm';
import { BarcodeScanner } from '@/components/admin/BarcodeScanner';
import { ApiClient } from '@/lib/api';
import { ToolForm as ToolFormType, ToolCategory } from '@/types';

export default function NewToolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [categories, setCategories] = useState<ToolCategory[]>([]);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [formData, setFormData] = useState<ToolFormType>({
    name: '',
    description: '',
    brand: '',
    model: '',
    barcode: '',
    serialNumber: '',
    categoryId: '',
    condition: 'GOOD',
    status: 'AVAILABLE',
    imageUrl: '',
    purchaseDate: '',
    purchasePrice: 0,
    location: '',
    membershipRequired: 'basic'
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await ApiClient.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setError('Failed to load categories');
    }
  };

  const handleFormSubmit = async (toolData: ToolFormType) => {
    setLoading(true);
    setError(null);

    try {
      await ApiClient.createTool(toolData);
      setSuccessMessage('Tool created successfully!');
      
      // Show success message briefly then redirect
      setTimeout(() => {
        router.push('/admin/tools');
      }, 2000);
    } catch (error) {
      console.error('Failed to create tool:', error);
      setError(error instanceof Error ? error.message : 'Failed to create tool');
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScanned = (barcode: string) => {
    setFormData(prev => ({ ...prev, barcode }));
    setShowBarcodeScanner(false);
  };

  const handleFormChange = (data: Partial<ToolFormType>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  return (
    <AdminLayout title="Add New Tool">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Tool</h1>
              <p className="mt-2 text-gray-600">
                Add a new tool to your inventory with detailed information and tracking
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBarcodeScanner(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                </svg>
                Scan Barcode
              </button>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Tools
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{successMessage}</p>
                <p className="text-xs text-green-600 mt-1">Redirecting to tools list...</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
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

        {/* Tool Form */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <ToolForm
            initialData={formData}
            categories={categories}
            loading={loading}
            onSubmit={handleFormSubmit}
            onChange={handleFormChange}
            onCancel={() => router.back()}
            submitLabel="Create Tool"
            mode="create"
          />
        </div>

        {/* Barcode Scanner Modal */}
        {showBarcodeScanner && (
          <BarcodeScanner
            onBarcodeScanned={handleBarcodeScanned}
            onClose={() => setShowBarcodeScanner(false)}
          />
        )}

        {/* Quick Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">
            <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Quick Tips for Adding Tools
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Essential Information:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Use clear, descriptive tool names</li>
                <li>Include brand and model when available</li>
                <li>Write detailed descriptions with usage notes</li>
                <li>Set appropriate membership requirements</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Best Practices:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Take high-quality photos from multiple angles</li>
                <li>Use the barcode scanner for accurate tracking</li>
                <li>Set realistic condition assessments</li>
                <li>Specify storage locations clearly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}