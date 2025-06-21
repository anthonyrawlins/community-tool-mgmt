'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ApiClient } from '@/lib/api';

interface ImportResult {
  imported: number;
  errors: string[];
  warnings?: string[];
}

export default function ImportToolsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setImportResult(null);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    setError(null);

    try {
      const result = await ApiClient.importTools(selectedFile);
      setImportResult(result.data);
      
      if (result.data.imported > 0) {
        // Show success and redirect after a delay
        setTimeout(() => {
          router.push('/admin/tools');
        }, 3000);
      }
    } catch (error) {
      console.error('Import failed:', error);
      setError(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `name,description,brand,model,barcode,serialNumber,categoryId,condition,status,location,purchaseDate,purchasePrice,membershipRequired
Circular Saw,7-1/4" circular saw with laser guide,DeWalt,DWE575,123456789012,ABC123,cat-power-tools,GOOD,AVAILABLE,Shelf A1,2024-01-15,299.99,basic
Drill Driver,18V cordless drill driver,Milwaukee,2801-20,234567890123,XYZ789,cat-power-tools,EXCELLENT,AVAILABLE,Shelf A2,2024-02-01,199.99,basic
Hammer,16oz claw hammer,Stanley,51-616,345678901234,DEF456,cat-hand-tools,GOOD,AVAILABLE,Bin C3,2023-12-10,24.99,basic`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tools-import-template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <AdminLayout title="Import Tools">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Import Tools</h1>
              <p className="mt-2 text-gray-600">
                Bulk import tools from a CSV file to quickly populate your inventory
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={downloadTemplate}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Template
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

        {/* Error Message */}
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

        {/* Import Result */}
        {importResult && (
          <div className="mb-6 space-y-4">
            {importResult.imported > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800">
                      Successfully imported {importResult.imported} tool{importResult.imported !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-green-600 mt-1">Redirecting to tools list...</p>
                  </div>
                </div>
              </div>
            )}

            {importResult.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800 font-medium mb-2">
                      {importResult.errors.length} error{importResult.errors.length !== 1 ? 's' : ''} occurred:
                    </p>
                    <ul className="text-sm text-red-700 space-y-1">
                      {importResult.errors.map((error, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* File Upload Area */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Upload CSV File</h2>
          
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : selectedFile
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            } ${importing ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
            role="button"
            tabIndex={0}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".csv"
              onChange={handleFileInput}
              disabled={importing}
            />

            {importing ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">Importing tools...</p>
                <p className="text-sm text-gray-600">Please wait while we process your file</p>
              </div>
            ) : selectedFile ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">File selected</p>
                <p className="text-sm text-gray-600 mb-4">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-400 rounded-full mb-4">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  <span className="text-primary">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-gray-600">CSV files up to 10MB</p>
              </div>
            )}
          </div>

          {selectedFile && !importing && (
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setImportResult(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              >
                Remove File
              </button>
              <button
                onClick={handleImport}
                className="px-6 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              >
                Import Tools
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">
            <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Import Instructions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-3">Required Columns:</h4>
              <ul className="space-y-1">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <strong>name:</strong> Tool name (required)
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <strong>description:</strong> Tool description (required)
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <strong>categoryId:</strong> Category ID (required)
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <strong>condition:</strong> EXCELLENT, GOOD, FAIR, NEEDS_REPAIR
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <strong>status:</strong> AVAILABLE, MAINTENANCE, RETIRED
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Optional Columns:</h4>
              <ul className="space-y-1">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <strong>brand, model:</strong> Manufacturer details
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <strong>barcode, serialNumber:</strong> Identifiers
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <strong>location:</strong> Storage location
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <strong>purchaseDate:</strong> YYYY-MM-DD format
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <strong>purchasePrice:</strong> Numeric value
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-100 rounded border border-blue-300">
            <p className="text-sm text-blue-900">
              <strong>Tip:</strong> Download the template file to see the exact format required. 
              Make sure category IDs exist in your system before importing, or create them first.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}