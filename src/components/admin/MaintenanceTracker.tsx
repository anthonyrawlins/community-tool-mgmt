'use client';

import React, { useState, useEffect } from 'react';
import { Tool } from '@/types';

interface MaintenanceRecord {
  id: string;
  toolId: string;
  type: 'routine' | 'repair' | 'calibration' | 'replacement';
  description: string;
  performedBy: string;
  performedAt: Date;
  nextDue?: Date;
  cost?: number;
  notes?: string;
}

interface MaintenanceTrackerProps {
  tool: Tool;
  onClose: () => void;
  onMaintenanceUpdated: () => void;
}

export function MaintenanceTracker({ tool, onClose, onMaintenanceUpdated }: MaintenanceTrackerProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'schedule' | 'add'>('history');
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newMaintenance, setNewMaintenance] = useState({
    type: 'routine' as const,
    description: '',
    performedBy: '',
    cost: '',
    notes: '',
    nextDue: ''
  });

  useEffect(() => {
    loadMaintenanceHistory();
  }, [tool.id]);

  const loadMaintenanceHistory = async () => {
    try {
      setLoading(true);
      // This would call an API endpoint to get maintenance history
      // For now, we'll simulate with mock data
      setMaintenanceHistory([
        {
          id: '1',
          toolId: tool.id,
          type: 'routine',
          description: 'Blade sharpening and cleaning',
          performedBy: 'John Smith',
          performedAt: new Date('2024-01-15'),
          nextDue: new Date('2024-07-15'),
          cost: 25.00,
          notes: 'All components checked and working properly'
        },
        {
          id: '2',
          toolId: tool.id,
          type: 'repair',
          description: 'Replaced power cord',
          performedBy: 'Tech Service',
          performedAt: new Date('2023-11-20'),
          cost: 45.00,
          notes: 'Old cord was damaged, replaced with OEM part'
        }
      ]);
    } catch (error) {
      console.error('Failed to load maintenance history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // This would call an API endpoint to save the maintenance record
      const newRecord: MaintenanceRecord = {
        id: Date.now().toString(),
        toolId: tool.id,
        type: newMaintenance.type,
        description: newMaintenance.description,
        performedBy: newMaintenance.performedBy,
        performedAt: new Date(),
        nextDue: newMaintenance.nextDue ? new Date(newMaintenance.nextDue) : undefined,
        cost: newMaintenance.cost ? parseFloat(newMaintenance.cost) : undefined,
        notes: newMaintenance.notes || undefined
      };

      setMaintenanceHistory(prev => [newRecord, ...prev]);
      
      // Reset form
      setNewMaintenance({
        type: 'routine',
        description: '',
        performedBy: '',
        cost: '',
        notes: '',
        nextDue: ''
      });

      setActiveTab('history');
      onMaintenanceUpdated();
    } catch (error) {
      console.error('Failed to add maintenance record:', error);
    } finally {
      setSaving(false);
    }
  };

  const getMaintenanceTypeIcon = (type: string) => {
    switch (type) {
      case 'routine':
        return '🔧';
      case 'repair':
        return '🔨';
      case 'calibration':
        return '⚖️';
      case 'replacement':
        return '🔄';
      default:
        return '🛠️';
    }
  };

  const getMaintenanceTypeColor = (type: string) => {
    switch (type) {
      case 'routine':
        return 'bg-blue-100 text-blue-800';
      case 'repair':
        return 'bg-red-100 text-red-800';
      case 'calibration':
        return 'bg-purple-100 text-purple-800';
      case 'replacement':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const upcomingMaintenance = maintenanceHistory.filter(record => 
    record.nextDue && new Date(record.nextDue) > new Date()
  ).sort((a, b) => new Date(a.nextDue!).getTime() - new Date(b.nextDue!).getTime());

  const overdueMaintenance = maintenanceHistory.filter(record => 
    record.nextDue && new Date(record.nextDue) < new Date()
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white mb-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Maintenance Tracker</h3>
            <p className="text-sm text-gray-600">{tool.name} - {tool.brand} {tool.model}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mt-4">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              History ({maintenanceHistory.length})
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'schedule'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Schedule ({upcomingMaintenance.length + overdueMaintenance.length})
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'add'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Add Record
            </button>
          </nav>
        </div>

        <div className="mt-6 max-h-96 overflow-y-auto">
          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading maintenance history...</p>
                </div>
              ) : maintenanceHistory.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600">No maintenance records found</p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="mt-2 text-primary hover:text-primary/80 font-medium"
                  >
                    Add your first maintenance record
                  </button>
                </div>
              ) : (
                maintenanceHistory.map((record) => (
                  <div key={record.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-lg">{getMaintenanceTypeIcon(record.type)}</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMaintenanceTypeColor(record.type)}`}>
                            {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(record.performedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{record.description}</h4>
                        <p className="text-sm text-gray-600 mb-2">Performed by: {record.performedBy}</p>
                        {record.notes && (
                          <p className="text-sm text-gray-600 mb-2">{record.notes}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {record.cost && <span>Cost: ${record.cost.toFixed(2)}</span>}
                          {record.nextDue && (
                            <span className={`font-medium ${new Date(record.nextDue) < new Date() ? 'text-red-600' : 'text-blue-600'}`}>
                              Next due: {new Date(record.nextDue).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              {overdueMaintenance.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-red-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Overdue Maintenance ({overdueMaintenance.length})
                  </h4>
                  <div className="space-y-3">
                    {overdueMaintenance.map((record) => (
                      <div key={record.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-red-900">{record.description}</p>
                            <p className="text-sm text-red-700">
                              Due: {new Date(record.nextDue!).toLocaleDateString()} 
                              ({Math.floor((new Date().getTime() - new Date(record.nextDue!).getTime()) / (1000 * 60 * 60 * 24))} days overdue)
                            </p>
                          </div>
                          <button className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700">
                            Schedule Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {upcomingMaintenance.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-blue-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    Upcoming Maintenance ({upcomingMaintenance.length})
                  </h4>
                  <div className="space-y-3">
                    {upcomingMaintenance.map((record) => (
                      <div key={record.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-blue-900">{record.description}</p>
                            <p className="text-sm text-blue-700">
                              Due: {new Date(record.nextDue!).toLocaleDateString()}
                              ({Math.floor((new Date(record.nextDue!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining)
                            </p>
                          </div>
                          <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">
                            Mark Done
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {upcomingMaintenance.length === 0 && overdueMaintenance.length === 0 && (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-600">No scheduled maintenance</p>
                  <p className="text-sm text-gray-500 mt-1">All maintenance is up to date</p>
                </div>
              )}
            </div>
          )}

          {/* Add Record Tab */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddMaintenance} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maintenance Type
                  </label>
                  <select
                    value={newMaintenance.type}
                    onChange={(e) => setNewMaintenance(prev => ({ ...prev, type: e.target.value as any }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="routine">Routine Maintenance</option>
                    <option value="repair">Repair</option>
                    <option value="calibration">Calibration</option>
                    <option value="replacement">Part Replacement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Performed By
                  </label>
                  <input
                    type="text"
                    value={newMaintenance.performedBy}
                    onChange={(e) => setNewMaintenance(prev => ({ ...prev, performedBy: e.target.value }))}
                    placeholder="Name or service provider"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  value={newMaintenance.description}
                  onChange={(e) => setNewMaintenance(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What maintenance was performed?"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newMaintenance.cost}
                    onChange={(e) => setNewMaintenance(prev => ({ ...prev, cost: e.target.value }))}
                    placeholder="0.00"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Next Due Date
                  </label>
                  <input
                    type="date"
                    value={newMaintenance.nextDue}
                    onChange={(e) => setNewMaintenance(prev => ({ ...prev, nextDue: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newMaintenance.notes}
                  onChange={(e) => setNewMaintenance(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Additional notes about the maintenance performed..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {saving && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {saving ? 'Saving...' : 'Add Record'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}