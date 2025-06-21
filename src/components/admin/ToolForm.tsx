'use client';

import React, { useState, useEffect } from 'react';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { ApiClient } from '@/lib/api';
import { ToolForm as ToolFormType, ToolCategory, ToolCondition, ToolStatus, MembershipType } from '@/types';

interface ToolFormProps {
  initialData: ToolFormType;
  categories: ToolCategory[];
  loading: boolean;
  onSubmit: (data: ToolFormType) => Promise<void>;
  onChange: (data: Partial<ToolFormType>) => void;
  onCancel: () => void;
  submitLabel: string;
  mode: 'create' | 'edit';
}

export function ToolForm({
  initialData,
  categories,
  loading,
  onSubmit,
  onChange,
  onCancel,
  submitLabel,
  mode
}: ToolFormProps) {
  const [formData, setFormData] = useState<ToolFormType>(initialData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    const newValue = type === 'number' ? (value === '' ? 0 : Number(value)) : value;
    const updatedData = { ...formData, [name]: newValue };
    
    setFormData(updatedData);
    onChange({ [name]: newValue });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tool name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (formData.purchasePrice && formData.purchasePrice < 0) {
      newErrors.purchasePrice = 'Purchase price cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    setUploading(true);
    try {
      const response = await ApiClient.uploadFile(file, 'tool-image');
      return response.data.url;
    } catch (error) {
      throw new Error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = (file: File | null, previewUrl: string | null) => {
    setImageFile(file);
    if (previewUrl) {
      const updatedData = { ...formData, imageUrl: previewUrl };
      setFormData(updatedData);
      onChange({ imageUrl: previewUrl });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      let finalData = { ...formData };

      // Upload image if a new one was selected
      if (imageFile) {
        const imageUrl = await handleImageUpload(imageFile);
        finalData = { ...finalData, imageUrl };
      }

      // Clean up empty optional fields
      if (!finalData.purchaseDate) {
        finalData.purchaseDate = undefined;
      }
      if (!finalData.purchasePrice) {
        finalData.purchasePrice = undefined;
      }

      await onSubmit(finalData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const conditionOptions = [
    { label: 'Excellent', value: 'EXCELLENT' },
    { label: 'Good', value: 'GOOD' },
    { label: 'Fair', value: 'FAIR' },
    { label: 'Needs Repair', value: 'NEEDS_REPAIR' }
  ];

  const statusOptions = [
    { label: 'Available', value: 'AVAILABLE' },
    { label: 'On Loan', value: 'ON_LOAN' },
    { label: 'Maintenance', value: 'MAINTENANCE' },
    { label: 'Lost', value: 'LOST' },
    { label: 'Retired', value: 'RETIRED' }
  ];

  const membershipOptions = [
    { label: 'Basic Member', value: 'basic' },
    { label: 'Premium Member', value: 'premium' }
  ];

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-8">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tool Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Circular Saw"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.categoryId ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select category...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand || ''}
              onChange={handleInputChange}
              placeholder="e.g., DeWalt"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model
            </label>
            <input
              type="text"
              name="model"
              value={formData.model || ''}
              onChange={handleInputChange}
              placeholder="e.g., DWE575"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            placeholder="Detailed description of the tool, its features, usage instructions, and any safety notes..."
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>
      </div>

      {/* Identification */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Identification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Barcode
            </label>
            <div className="flex">
              <input
                type="text"
                name="barcode"
                value={formData.barcode || ''}
                onChange={handleInputChange}
                placeholder="Scan or enter barcode"
                className="block w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                title="Scan barcode with camera"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Serial Number
            </label>
            <input
              type="text"
              name="serialNumber"
              value={formData.serialNumber || ''}
              onChange={handleInputChange}
              placeholder="Manufacturer serial number"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Status & Condition */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Status & Condition
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condition
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {conditionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location || ''}
              onChange={handleInputChange}
              placeholder="e.g., Shelf A3, Workshop"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Purchase Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Purchase Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purchase Date
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate || ''}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purchase Price ($)
            </label>
            <input
              type="number"
              name="purchasePrice"
              value={formData.purchasePrice || ''}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.purchasePrice ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.purchasePrice && <p className="mt-1 text-sm text-red-600">{errors.purchasePrice}</p>}
          </div>
        </div>
      </div>

      {/* Access Requirements */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Access Requirements
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Membership Required
          </label>
          <select
            name="membershipRequired"
            value={formData.membershipRequired || 'basic'}
            onChange={handleInputChange}
            className="block w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {membershipOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Minimum membership level required to borrow this tool
          </p>
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Tool Image
        </h3>
        <ImageUpload
          currentImageUrl={formData.imageUrl}
          onImageChange={handleImageChange}
          uploading={uploading}
          maxSizeMB={5}
          acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          disabled={loading || uploading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || uploading}
          className="px-6 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          {(loading || uploading) && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {uploading ? 'Uploading...' : loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}