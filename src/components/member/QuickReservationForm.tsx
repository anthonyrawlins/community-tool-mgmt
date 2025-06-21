'use client';

import { useState } from 'react';
import { Tool, ReservationForm } from '@/types';
import { ApiClient } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface QuickReservationFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function QuickReservationForm({ onSuccess, onError }: QuickReservationFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [formData, setFormData] = useState<ReservationForm>({
    toolId: '',
    startDate: '',
    endDate: '',
    notes: '',
  });

  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await ApiClient.searchTools(query);
      setSearchResults(response.data.tools);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTool) return;

    setLoading(true);
    try {
      await ApiClient.createReservation({
        ...formData,
        toolId: selectedTool.id,
      });
      
      // Reset form
      setFormData({ toolId: '', startDate: '', endDate: '', notes: '' });
      setSelectedTool(null);
      setSearchQuery('');
      setSearchResults([]);
      setIsOpen(false);
      
      onSuccess?.();
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to create reservation');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Reservation</h3>
        <p className="text-gray-600 mb-4">Reserve a tool for future pickup</p>
        <Button onClick={() => setIsOpen(true)}>
          Make a Reservation
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Quick Reservation</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-500"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tool Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search for a tool
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            placeholder="Start typing to search tools..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-2 border border-gray-200 rounded-md max-h-48 overflow-y-auto">
              {searchResults.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    setSelectedTool(tool);
                    setSearchQuery(tool.name);
                    setSearchResults([]);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium">{tool.name}</div>
                  {tool.brand && (
                    <div className="text-sm text-gray-600">{tool.brand}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Tool Display */}
        {selectedTool && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center">
                {selectedTool.imageUrl ? (
                  <img
                    src={selectedTool.imageUrl}
                    alt={selectedTool.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <span className="text-lg">🔧</span>
                )}
              </div>
              <div>
                <div className="font-medium text-blue-900">{selectedTool.name}</div>
                {selectedTool.brand && (
                  <div className="text-sm text-blue-700">{selectedTool.brand}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Date Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              min={formData.startDate || new Date().toISOString().split('T')[0]}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            placeholder="Any special requests or notes..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={!selectedTool || !formData.startDate || !formData.endDate || loading}
            loading={loading}
          >
            Create Reservation
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}