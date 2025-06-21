'use client';

import React from 'react';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface LineChartData {
  label: string;
  data: Array<{
    x: string;
    y: number;
  }>;
  color?: string;
}

interface ChartProps {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  data: ChartData[] | LineChartData[];
  title?: string;
  height?: number;
  loading?: boolean;
  showLegend?: boolean;
  showValues?: boolean;
}

export function Chart({ 
  type, 
  data, 
  title, 
  height = 300, 
  loading = false, 
  showLegend = true, 
  showValues = true 
}: ChartProps) {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        {title && <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>}
        <div 
          className="bg-gray-200 rounded animate-pulse"
          style={{ height: `${height}px` }}
        ></div>
      </div>
    );
  }

  // Simple bar chart implementation
  if (type === 'bar' && Array.isArray(data) && data.length > 0) {
    const barData = data as ChartData[];
    const maxValue = Math.max(...barData.map(d => d.value));
    
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        {title && <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>}
        <div style={{ height: `${height}px` }} className="flex items-end space-x-2">
          {barData.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-blue-500 rounded-t"
                style={{ 
                  height: `${(item.value / maxValue) * (height - 60)}px`,
                  backgroundColor: item.color || '#3B82F6'
                }}
              ></div>
              <div className="mt-2 text-xs text-center text-gray-600 max-w-full">
                <div className="truncate">{item.label}</div>
                {showValues && <div className="font-medium">{item.value}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Simple line chart implementation
  if (type === 'line' && Array.isArray(data) && data.length > 0) {
    const lineData = data as LineChartData[];
    
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        {title && <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>}
        <div style={{ height: `${height}px` }} className="relative">
          <div className="text-center text-gray-500 mt-20">
            Line Chart Implementation
            <br />
            <small>Chart.js or similar library would be integrated here</small>
          </div>
        </div>
        {showLegend && (
          <div className="mt-4 flex flex-wrap gap-4">
            {lineData.map((series, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: series.color || '#3B82F6' }}
                ></div>
                <span className="text-sm text-gray-600">{series.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Simple pie chart implementation
  if (type === 'pie' && Array.isArray(data) && data.length > 0) {
    const pieData = data as ChartData[];
    const total = pieData.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        {title && <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>}
        <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-gray-500">
              Pie Chart Implementation
              <br />
              <small>Chart.js or similar library would be integrated here</small>
            </div>
          </div>
        </div>
        {showLegend && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color || `hsl(${index * 45}, 70%, 50%)` }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <span className="text-sm font-medium">
                  {showValues && `${item.value} (${((item.value / total) * 100).toFixed(1)}%)`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {title && <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>}
      <div 
        className="flex items-center justify-center text-gray-500"
        style={{ height: `${height}px` }}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <div>Chart Component</div>
          <small>No data available</small>
        </div>
      </div>
    </div>
  );
}