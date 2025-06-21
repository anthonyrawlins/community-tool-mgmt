'use client';

import React, { useState, useRef, useCallback } from 'react';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageChange: (file: File | null, previewUrl: string | null) => void;
  uploading?: boolean;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  multiple?: boolean;
}

export function ImageUpload({
  currentImageUrl,
  onImageChange,
  uploading = false,
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  multiple = false
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type not supported. Please upload ${acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} files only.`;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size too large. Maximum size is ${maxSizeMB}MB.`;
    }

    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onImageChange(file, url);
  }, [onImageChange, maxSizeMB, acceptedTypes]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setError(null);
    onImageChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-primary bg-primary/5'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        } ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          disabled={uploading}
          multiple={multiple}
        />

        {uploading ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
              <svg className="animate-spin h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-sm text-gray-600">Uploading image...</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-400 rounded-full mb-4">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} up to {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
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

      {/* Preview */}
      {previewUrl && (
        <div className="relative">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <img
                src={previewUrl}
                alt="Tool preview"
                className="h-32 w-32 object-cover rounded-lg border border-gray-200 shadow-sm"
              />
              {!uploading && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  title="Remove image"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Image Preview</p>
              <p className="text-sm text-gray-500">
                This image will be displayed in the tool catalog and inventory list
              </p>
              {!uploading && (
                <button
                  onClick={openFileDialog}
                  className="mt-2 text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Change image
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Image Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li className="flex items-start">
            <svg className="h-4 w-4 mt-0.5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Take photos in good lighting with minimal background
          </li>
          <li className="flex items-start">
            <svg className="h-4 w-4 mt-0.5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Show the tool from its most recognizable angle
          </li>
          <li className="flex items-start">
            <svg className="h-4 w-4 mt-0.5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Include any accessories or important features
          </li>
          <li className="flex items-start">
            <svg className="h-4 w-4 mt-0.5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Ensure images are clear and in focus
          </li>
        </ul>
      </div>
    </div>
  );
}