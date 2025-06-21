'use client';

import React from 'react';

interface MetricData {
  label: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
    period: string;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
}

interface MetricsCardProps {
  title: string;
  metrics: MetricData[];
  loading?: boolean;
  className?: string;
}

const colorStyles = {
  blue: 'text-blue-600 bg-blue-50',
  green: 'text-green-600 bg-green-50',
  yellow: 'text-yellow-600 bg-yellow-50',
  red: 'text-red-600 bg-red-50',
  purple: 'text-purple-600 bg-purple-50',
  gray: 'text-gray-600 bg-gray-50'
};

export function MetricsCard({ 
  title, 
  metrics, 
  loading = false, 
  className = '' 
}: MetricsCardProps) {
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };

  const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 ${className}`}>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <span className="text-sm text-gray-600">{metric.label}</span>
                {metric.trend && (
                  <div className="text-xs mt-1">
                    <span className={`font-medium ${getTrendColor(metric.trend.direction)}`}>
                      {getTrendIcon(metric.trend.direction)} {metric.trend.percentage}%
                    </span>
                    <span className="text-gray-500 ml-1">vs {metric.trend.period}</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className={`text-lg font-semibold px-2 py-1 rounded ${
                  metric.color ? colorStyles[metric.color] : 'text-gray-900'
                }`}>
                  {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}