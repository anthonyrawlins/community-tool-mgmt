'use client';

import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
    period: string;
  };
  icon?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  loading?: boolean;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    text: 'text-blue-600'
  },
  green: {
    bg: 'bg-green-50',
    iconBg: 'bg-green-100',
    iconText: 'text-green-600',
    text: 'text-green-600'
  },
  yellow: {
    bg: 'bg-yellow-50',
    iconBg: 'bg-yellow-100',
    iconText: 'text-yellow-600',
    text: 'text-yellow-600'
  },
  red: {
    bg: 'bg-red-50',
    iconBg: 'bg-red-100',
    iconText: 'text-red-600',
    text: 'text-red-600'
  },
  purple: {
    bg: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-600',
    text: 'text-purple-600'
  },
  gray: {
    bg: 'bg-gray-50',
    iconBg: 'bg-gray-100',
    iconText: 'text-gray-600',
    text: 'text-gray-600'
  }
};

export function StatsCard({ 
  title, 
  value, 
  change, 
  icon, 
  color = 'blue', 
  loading = false 
}: StatsCardProps) {
  const colors = colorClasses[color];

  if (loading) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`h-8 w-8 rounded-md ${colors.iconBg} animate-pulse`}></div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className={`${colors.bg} px-5 py-3`}>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '→';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {icon ? (
              <div className={`h-8 w-8 rounded-md ${colors.iconBg} flex items-center justify-center`}>
                <span className={`text-lg ${colors.iconText}`}>{icon}</span>
              </div>
            ) : (
              <div className={`h-8 w-8 rounded-md ${colors.iconBg}`}></div>
            )}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-3xl font-semibold text-gray-900">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {change && (
        <div className={`${colors.bg} px-5 py-3`}>
          <div className="text-sm">
            <span className={`font-medium ${getTrendColor(change.trend)}`}>
              {getTrendIcon(change.trend)} {Math.abs(change.value)}%
            </span>
            <span className="text-gray-500 ml-1">from {change.period}</span>
          </div>
        </div>
      )}
    </div>
  );
}