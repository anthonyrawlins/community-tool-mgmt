interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  description?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({
  title,
  value,
  icon,
  description,
  color = 'blue',
  trend,
}: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
  };

  return (
    <div className={`border rounded-lg p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {description && (
            <p className="text-sm opacity-75 mt-1">{description}</p>
          )}
        </div>
        <div className="text-3xl opacity-75">{icon}</div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center gap-1">
          <span className={`text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
          </span>
          <span className="text-sm opacity-75">from last month</span>
        </div>
      )}
    </div>
  );
}