'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ToolForm } from '@/components/admin/ToolForm';
import { BarcodeScanner } from '@/components/admin/BarcodeScanner';
import { MaintenanceTracker } from '@/components/admin/MaintenanceTracker';
import { ApiClient } from '@/lib/api';
import { Tool, ToolForm as ToolFormType, ToolCategory } from '@/types';

export default function EditToolPage() {
  const router = useRouter();
  const params = useParams();
  const toolId = params.id as string;

  const [tool, setTool] = useState<Tool | null>(null);
  const [categories, setCategories] = useState<ToolCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showMaintenanceTracker, setShowMaintenanceTracker] = useState(false);
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
    loadInitialData();
  }, [toolId]);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [toolResponse, categoriesResponse] = await Promise.all([
        ApiClient.getToolById(toolId),
        ApiClient.getCategories()
      ]);

      const toolData = toolResponse.data.tool;
      setTool(toolData);
      setCategories(categoriesResponse.data.categories);

      // Convert tool data to form format
      setFormData({
        name: toolData.name,
        description: toolData.description,
        brand: toolData.brand || '',
        model: toolData.model || '',
        barcode: toolData.barcode || '',
        serialNumber: toolData.serialNumber || '',
        categoryId: toolData.category?.id || '',
        condition: toolData.condition,
        status: toolData.status,
        imageUrl: toolData.imageUrl || '',
        purchaseDate: toolData.purchaseDate ? new Date(toolData.purchaseDate).toISOString().split('T')[0] : '',
        purchasePrice: toolData.purchasePrice || 0,
        location: toolData.location || '',
        membershipRequired: toolData.membershipRequired || 'basic'
      });
    } catch (error) {
      console.error('Failed to load tool data:', error);
      setError('Failed to load tool data');
    } finally {
      setLoading(false);
    }
  }, [toolId]);

  const handleFormSubmit = async (toolData: ToolFormType) => {
    setSaving(true);
    setError(null);

    try {
      await ApiClient.updateTool(toolId, toolData);
      setSuccessMessage('Tool updated successfully!');
      
      // Reload tool data to reflect changes
      await loadInitialData();
      
      // Show success message briefly
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (error) {
      console.error('Failed to update tool:', error);
      setError(error instanceof Error ? error.message : 'Failed to update tool');
    } finally {
      setSaving(false);
    }
  };

  const handleBarcodeScanned = (barcode: string) => {
    setFormData(prev => ({ ...prev, barcode }));
    setShowBarcodeScanner(false);
  };

  const handleFormChange = (data: Partial<ToolFormType>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this tool? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      await ApiClient.deleteTool(toolId);
      setSuccessMessage('Tool deleted successfully');
      setTimeout(() => {
        router.push('/admin/tools');
      }, 2000);
    } catch (error) {
      console.error('Failed to delete tool:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete tool');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Tool">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
              <span className="text-gray-600">Loading tool...</span>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!tool) {
    return (
      <AdminLayout title="Tool Not Found">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m6 5H3a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tool not found</h3>
            <p className="text-gray-600 mb-4">The tool you&apos;re looking for doesn&apos;t exist or may have been deleted.</p>
            <button
              onClick={() => router.push('/admin/tools')}
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Tools
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Edit ${tool.name}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Tool</h1>
              <p className="mt-2 text-gray-600">
                Update tool information, manage maintenance, and track changes
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowMaintenanceTracker(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Maintenance
              </button>
              <button
                onClick={() => setShowBarcodeScanner(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                </svg>
                Update Barcode
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

        {/* Tool Info Summary */}
        <div className="mb-8 bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {tool.imageUrl && (
                <img
                  src={tool.imageUrl}
                  alt={tool.name}
                  className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                />
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{tool.name}</h2>
                <p className="text-gray-600">
                  {tool.brand && tool.model ? `${tool.brand} ${tool.model}` : 'Tool Details'}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    tool.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                    tool.status === 'ON_LOAN' ? 'bg-blue-100 text-blue-800' :
                    tool.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {tool.status.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-500">
                    Last updated: {new Date(tool.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Tool ID</p>
              <p className="font-mono text-sm text-gray-900">{tool.id}</p>
            </div>
          </div>
        </div>

        {/* Tool Form */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-8">
          <ToolForm
            initialData={formData}
            categories={categories}
            loading={saving}
            onSubmit={handleFormSubmit}
            onChange={handleFormChange}
            onCancel={() => router.back()}
            submitLabel="Update Tool"
            mode="edit"
          />
        </div>

        {/* Danger Zone */}
        <div className="bg-white shadow-sm rounded-lg border border-red-200 border-l-4 border-l-red-500">
          <div className="p-6">
            <h3 className="text-lg font-medium text-red-900 mb-2">Danger Zone</h3>
            <p className="text-sm text-red-700 mb-4">
              Once you delete this tool, there is no going back. Please be certain.
            </p>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Tool
            </button>
          </div>
        </div>

        {/* Barcode Scanner Modal */}
        {showBarcodeScanner && (
          <BarcodeScanner
            onBarcodeScanned={handleBarcodeScanned}
            onClose={() => setShowBarcodeScanner(false)}
          />
        )}

        {/* Maintenance Tracker Modal */}
        {showMaintenanceTracker && (
          <MaintenanceTracker
            tool={tool}
            onClose={() => setShowMaintenanceTracker(false)}
            onMaintenanceUpdated={loadInitialData}
          />
        )}
      </div>
    </AdminLayout>
  );
}