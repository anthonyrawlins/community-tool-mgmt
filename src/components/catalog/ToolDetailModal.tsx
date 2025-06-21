'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { ApiClient } from '@/lib/api';
import { Tool } from '@/types';
import { formatDate } from '@/utils/format';

interface ToolDetailModalProps {
  toolId: string;
  isOpen: boolean;
  onClose: () => void;
  originElement?: HTMLElement | null;
}

export const ToolDetailModal = ({ toolId, isOpen, onClose, originElement }: ToolDetailModalProps) => {
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen && toolId) {
      fetchTool();
    }
  }, [isOpen, toolId]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      animateIn();
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const fetchTool = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ApiClient.getToolById(toolId);
      setTool(response.data.tool);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tool details');
    } finally {
      setLoading(false);
    }
  };

  const animateIn = () => {
    if (!modalRef.current || !originElement) return;

    const modal = modalRef.current;
    const rect = originElement.getBoundingClientRect();
    
    // Set initial position and size to match the origin element
    modal.style.position = 'fixed';
    modal.style.top = `${rect.top}px`;
    modal.style.left = `${rect.left}px`;
    modal.style.width = `${rect.width}px`;
    modal.style.height = `${rect.height}px`;
    modal.style.transform = 'scale(1)';
    modal.style.opacity = '0';
    modal.style.borderRadius = '8px';
    modal.style.transition = 'none';

    // Force reflow
    modal.offsetHeight;

    // Animate to full screen
    modal.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    modal.style.top = '2rem';
    modal.style.left = '2rem';
    modal.style.width = 'calc(100vw - 4rem)';
    modal.style.height = 'calc(100vh - 4rem)';
    modal.style.opacity = '1';
    modal.style.borderRadius = '12px';
  };

  const animateOut = () => {
    if (!modalRef.current || !originElement) {
      onClose();
      return;
    }

    const modal = modalRef.current;
    const rect = originElement.getBoundingClientRect();

    // Animate back to origin
    modal.style.transition = 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
    modal.style.top = `${rect.top}px`;
    modal.style.left = `${rect.left}px`;
    modal.style.width = `${rect.width}px`;
    modal.style.height = `${rect.height}px`;
    modal.style.opacity = '0';
    modal.style.borderRadius = '8px';

    setTimeout(() => {
      onClose();
    }, 250);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      animateOut();
    }
  };

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      animateOut();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isOpen]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ON_LOAN':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'MAINTENANCE':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'LOST':
      case 'RETIRED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'EXCELLENT':
        return 'text-green-600';
      case 'GOOD':
        return 'text-blue-600';
      case 'FAIR':
        return 'text-yellow-600';
      case 'NEEDS_REPAIR':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Tool Details</h2>
          <button
            onClick={animateOut}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="h-full overflow-y-auto">
          {loading && (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={fetchTool}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {tool && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                  {/* Tool Header */}
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-2">{tool.name}</h1>
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(tool.status)}`}>
                        {tool.status.replace('_', ' ')}
                      </span>
                      {tool.membershipRequired && (
                        <span className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200 rounded-full">
                          {tool.membershipRequired.toUpperCase()} ONLY
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 leading-relaxed">{tool.description}</p>
                  </div>

                  {/* Tool Image */}
                  <div className="mb-6">
                    <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                      {tool.imageUrl ? (
                        <img 
                          src={tool.imageUrl} 
                          alt={tool.name}
                          className="max-h-full max-w-full object-contain rounded-lg"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="text-gray-400 mb-2">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-gray-500">No image available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium">{tool.category.name}</span>
                        </div>
                        {tool.brand && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Brand:</span>
                            <span className="font-medium">{tool.brand}</span>
                          </div>
                        )}
                        {tool.model && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Model:</span>
                            <span className="font-medium">{tool.model}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Condition:</span>
                          <span className={`font-medium ${getConditionColor(tool.condition)}`}>
                            {tool.condition.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {tool.location && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Location:</span>
                            <span className="font-medium">{tool.location}</span>
                          </div>
                        )}
                        {tool.barcode && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Barcode:</span>
                            <span className="font-mono text-xs">{tool.barcode}</span>
                          </div>
                        )}
                        {tool.serialNumber && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Serial:</span>
                            <span className="font-mono text-xs">{tool.serialNumber}</span>
                          </div>
                        )}
                        {tool.purchaseDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Purchased:</span>
                            <span className="font-medium text-xs">{formatDate(tool.purchaseDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  {/* Reservation Actions */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Reserve This Tool</h3>
                    
                    {tool.status === 'AVAILABLE' ? (
                      <div className="space-y-3">
                        <p className="text-xs text-gray-600">
                          This tool is currently available for borrowing.
                        </p>
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              // TODO: Implement reservation flow
                              alert('Reservation functionality coming soon!');
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                          >
                            Reserve Now
                          </button>
                          <button
                            onClick={() => {
                              // TODO: Implement availability check
                              alert('Availability check coming soon!');
                            }}
                            className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded text-sm font-medium transition-colors"
                          >
                            Check Availability
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs text-gray-600">
                          This tool is currently {tool.status.toLowerCase().replace('_', ' ')}.
                        </p>
                        <button
                          onClick={() => {
                            // TODO: Implement availability check
                            alert('Availability check coming soon!');
                          }}
                          className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded text-sm font-medium transition-colors"
                        >
                          Check Future Availability
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Category Info */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Category</h3>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">{tool.category.name}</h4>
                      {tool.category.description && (
                        <p className="text-xs text-gray-600">{tool.category.description}</p>
                      )}
                      <button
                        onClick={() => {
                          animateOut();
                          // TODO: Apply category filter
                        }}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        View all tools in this category →
                      </button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Need Help?</h3>
                    <div className="space-y-2">
                      <Link
                        href="/contact"
                        className="block text-blue-600 hover:text-blue-800 text-xs"
                        onClick={animateOut}
                      >
                        Contact Us
                      </Link>
                      <Link
                        href="/how-it-works"
                        className="block text-blue-600 hover:text-blue-800 text-xs"
                        onClick={animateOut}
                      >
                        How Borrowing Works
                      </Link>
                      <Link
                        href="/faq"
                        className="block text-blue-600 hover:text-blue-800 text-xs"
                        onClick={animateOut}
                      >
                        FAQ
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};