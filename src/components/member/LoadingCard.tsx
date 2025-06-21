interface LoadingCardProps {
  title?: string;
  lines?: number;
}

export function LoadingCard({ title, lines = 3 }: LoadingCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
      {title && (
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
        ))}
      </div>
    </div>
  );
}

export function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  );
}