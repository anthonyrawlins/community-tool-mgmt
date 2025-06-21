'use client';

import React, { useState } from 'react';
import { BulkAction } from '@/types';

interface BulkActionsProps {
  selectedCount: number;
  onBulkAction: (action: BulkAction) => void;
  onClearSelection: () => void;
}

export function BulkActions({ selectedCount, onBulkAction, onClearSelection }: BulkActionsProps) {
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const handleStatusUpdate = () => {
    if (selectedStatus) {
      onBulkAction({
        action: 'update-status',
        selectedIds: [], // Will be populated by parent component
        data: { status: selectedStatus }
      });
      setShowStatusModal(false);
      setSelectedStatus('');
    }
  };

  const handleLocationUpdate = () => {
    if (selectedLocation) {
      onBulkAction({
        action: 'update-location',
        selectedIds: [], // Will be populated by parent component
        data: { location: selectedLocation }
      });
      setShowLocationModal(false);
      setSelectedLocation('');
    }
  };

  const bulkActions = [
    {
      id: 'update-status',
      label: 'Update Status',
      icon: '🔄',
      action: () => setShowStatusModal(true)
    },
    {
      id: 'update-location',
      label: 'Set Location',
      icon: '📍',
      action: () => setShowLocationModal(true)
    },
    {
      id: 'mark-maintenance',
      label: 'Mark as Maintenance',
      icon: '🔧',
      action: () => onBulkAction({
        action: 'update-status',
        selectedIds: [],
        data: { status: 'MAINTENANCE' }
      })
    },
    {
      id: 'mark-available',
      label: 'Mark as Available',
      icon: '✅',
      action: () => onBulkAction({
        action: 'update-status',
        selectedIds: [],
        data: { status: 'AVAILABLE' }
      })
    },
    {
      id: 'export-selected',
      label: 'Export Selected',
      icon: '📤',
      action: () => onBulkAction({
        action: 'export-selected',
        selectedIds: []
      })
    }
  ];

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">
                {selectedCount} tool{selectedCount !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                onClick={() => setShowActionMenu(!showActionMenu)}
                className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Bulk Actions
              </button>
              
              {showActionMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu">
                    {bulkActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => {
                          action.action();
                          setShowActionMenu(false);
                        }}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                        role="menuitem"
                      >
                        <span className="mr-3">{action.icon}</span>
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={onClearSelection}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Clear Selection
            </button>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Update Status</h3>
              <p className="text-sm text-gray-600 mb-4">
                Update the status for {selectedCount} selected tool{selectedCount !== 1 ? 's' : ''}
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="">Select status...</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="ON_LOAN">On Loan</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="LOST">Lost</option>
                  <option value="RETIRED">Retired</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedStatus('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={!selectedStatus}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Update Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Set Location</h3>
              <p className="text-sm text-gray-600 mb-4">
                Set the location for {selectedCount} selected tool{selectedCount !== 1 ? 's' : ''}
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  placeholder="Enter location (e.g., Shelf A1, Room 2, etc.)"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowLocationModal(false);
                    setSelectedLocation('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLocationUpdate}
                  disabled={!selectedLocation.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Set Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}