import { useRef } from 'react';
import Link from 'next/link';
import { Tool } from '@/types';
import { formatDate } from '@/utils/format';

interface ToolCardProps {
  tool: Tool;
  onOpenDetail: (toolId: string, originElement: HTMLElement) => void;
}

export const ToolCard = ({ tool, onOpenDetail }: ToolCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'ON_LOAN':
        return 'bg-yellow-100 text-yellow-800';
      case 'MAINTENANCE':
        return 'bg-orange-100 text-orange-800';
      case 'LOST':
      case 'RETIRED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const handleCardClick = () => {
    if (cardRef.current) {
      onOpenDetail(tool.id, cardRef.current);
    }
  };

  return (
    <div 
      ref={cardRef}
      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
              {tool.name}
            </h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {tool.description}
            </p>
          </div>
          <div className="ml-4 flex flex-col items-end gap-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tool.status)}`}>
              {tool.status.replace('_', ' ')}
            </span>
            {tool.membershipRequired && (
              <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                {tool.membershipRequired.toUpperCase()} ONLY
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Category:</span>
            <span className="font-medium">{tool.category.name}</span>
          </div>
          
          {tool.brand && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Brand:</span>
              <span className="font-medium">{tool.brand}</span>
            </div>
          )}
          
          {tool.model && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Model:</span>
              <span className="font-medium">{tool.model}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Condition:</span>
            <span className={`font-medium ${getConditionColor(tool.condition)}`}>
              {tool.condition.replace('_', ' ')}
            </span>
          </div>
          
          {tool.location && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Location:</span>
              <span className="font-medium">{tool.location}</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-blue-600 text-sm font-medium">
              Click to view details →
            </span>
            {tool.status === 'AVAILABLE' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Quick reserve action
                  alert('Quick reserve coming soon!');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
              >
                Reserve
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};