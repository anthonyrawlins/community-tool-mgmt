'use client';

import React from 'react';

export interface ActivityItem {
  id: string;
  type: 'registration' | 'checkout' | 'return' | 'overdue' | 'payment' | 'reservation' | 'approval';
  title: string;
  description?: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
  toolId?: string;
  toolName?: string;
  amount?: number;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  loading?: boolean;
  showViewAll?: boolean;
  onViewAll?: () => void;
  maxItems?: number;
}

const activityTypeStyles = {
  registration: { color: 'bg-green-400', icon: '👤' },
  checkout: { color: 'bg-blue-400', icon: '📦' },
  return: { color: 'bg-gray-400', icon: '✅' },
  overdue: { color: 'bg-yellow-400', icon: '⚠️' },
  payment: { color: 'bg-purple-400', icon: '💳' },
  reservation: { color: 'bg-indigo-400', icon: '📅' },
  approval: { color: 'bg-green-500', icon: '✅' }
};

export function ActivityFeed({ 
  activities, 
  loading = false, 
  showViewAll = true, 
  onViewAll,
  maxItems = 10 
}: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems);

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const renderActivityContent = (activity: ActivityItem) => {
    const style = activityTypeStyles[activity.type];
    
    return (
      <div key={activity.id} className="flex items-start space-x-3 py-3">
        <div className={`flex-shrink-0 w-3 h-3 rounded-full ${style.color} mt-1`}></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 text-sm">
            <span className="font-medium text-gray-900">{activity.title}</span>
            <span className="text-lg">{style.icon}</span>
          </div>
          {activity.description && (
            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
          )}
          {activity.userName && (
            <p className="text-xs text-gray-500 mt-1">
              User: {activity.userName}
            </p>
          )}
          {activity.toolName && (
            <p className="text-xs text-gray-500 mt-1">
              Tool: {activity.toolName}
            </p>
          )}
          {activity.amount && (
            <p className="text-xs text-gray-500 mt-1">
              Amount: ${activity.amount.toFixed(2)}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 text-xs text-gray-400">
          {formatTimestamp(activity.timestamp)}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse mt-1"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
      </div>
      <div className="p-6">
        {displayedActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-gray-500">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-1">
            {displayedActivities.map(renderActivityContent)}
          </div>
        )}
      </div>
      {showViewAll && displayedActivities.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onViewAll}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View all activity →
          </button>
        </div>
      )}
    </div>
  );
}