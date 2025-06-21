'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  badge?: {
    text: string;
    color: 'red' | 'green' | 'yellow' | 'blue';
  };
  disabled?: boolean;
  loading?: boolean;
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

const colorStyles = {
  blue: 'border-blue-200 hover:border-blue-300 hover:bg-blue-50',
  green: 'border-green-200 hover:border-green-300 hover:bg-green-50',
  yellow: 'border-yellow-200 hover:border-yellow-300 hover:bg-yellow-50',
  red: 'border-red-200 hover:border-red-300 hover:bg-red-50',
  purple: 'border-purple-200 hover:border-purple-300 hover:bg-purple-50',
  gray: 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
};

const badgeStyles = {
  red: 'bg-red-100 text-red-800',
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  blue: 'bg-blue-100 text-blue-800'
};

export function QuickActions({ 
  actions, 
  title = 'Quick Actions',
  columns = 4,
  className = ''
}: QuickActionsProps) {
  const router = useRouter();

  const getGridCols = () => {
    switch (columns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 sm:grid-cols-2';
      case 3: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    }
  };

  const handleActionClick = (action: QuickAction) => {
    if (action.disabled || action.loading) return;
    
    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      router.push(action.href);
    }
  };

  const renderActionCard = (action: QuickAction) => {
    const baseClasses = `relative bg-white p-6 rounded-lg shadow border-2 transition-all duration-200 cursor-pointer ${colorStyles[action.color]}`;
    const disabledClasses = action.disabled ? 'opacity-50 cursor-not-allowed' : '';
    const loadingClasses = action.loading ? 'animate-pulse' : '';

    return (
      <div
        key={action.id}
        className={`${baseClasses} ${disabledClasses} ${loadingClasses}`}
        onClick={() => handleActionClick(action)}
      >
        {action.badge && (
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeStyles[action.badge.color]}`}>
              {action.badge.text}
            </span>
          </div>
        )}
        
        <div className="flex items-center mb-3">
          <span className="text-2xl mr-3">{action.icon}</span>
          <h3 className="font-medium text-gray-900 flex-1">{action.title}</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">{action.description}</p>
        
        {action.loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={className}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
      <div className={`grid ${getGridCols()} gap-4`}>
        {actions.map(renderActionCard)}
      </div>
    </div>
  );
}