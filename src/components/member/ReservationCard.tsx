import { Reservation } from '@/types';
import { formatDate } from '@/utils/format';
import { Button } from '@/components/ui/Button';

interface ReservationCardProps {
  reservation: Reservation;
  onCancel?: (id: string) => void;
  onEdit?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  compact?: boolean;
}

export function ReservationCard({ 
  reservation, 
  onCancel, 
  onEdit, 
  onViewDetails, 
  compact = false 
}: ReservationCardProps) {
  const isUpcoming = new Date(reservation.startDate) > new Date();
  const daysUntilStart = Math.ceil((new Date(reservation.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  const statusColor = {
    'PENDING': 'yellow',
    'CONFIRMED': isUpcoming ? 'blue' : 'green',
    'CANCELLED': 'gray',
    'COMPLETED': 'gray',
  }[reservation.status];

  const statusText = {
    'PENDING': 'Pending Confirmation',
    'CONFIRMED': isUpcoming 
      ? (daysUntilStart <= 0 ? 'Ready for Pickup' : `Starts in ${daysUntilStart} days`)
      : 'Active',
    'CANCELLED': 'Cancelled',
    'COMPLETED': 'Completed',
  }[reservation.status];

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
  };

  return (
    <div className={`border rounded-lg p-4 ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-start gap-4">
        {/* Tool Image */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {reservation.tool.imageUrl ? (
              <img
                src={reservation.tool.imageUrl}
                alt={reservation.tool.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">🔧</span>
            )}
          </div>
        </div>

        {/* Tool Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {reservation.tool.name}
          </h3>
          {(reservation.tool.brand || reservation.tool.model) && (
            <p className="text-sm text-gray-600 truncate">
              {[reservation.tool.brand, reservation.tool.model].filter(Boolean).join(' ')}
            </p>
          )}
          
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                {formatDate(reservation.startDate)} - {formatDate(reservation.endDate)}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses[statusColor]}`}>
                {statusText}
              </span>
            </div>
            
            {reservation.notes && (
              <p className="text-gray-600 text-xs">
                Note: {reservation.notes}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {!compact && (
          <div className="flex-shrink-0 flex flex-col gap-2">
            {onViewDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(reservation.id)}
              >
                Details
              </Button>
            )}
            {onEdit && reservation.status === 'PENDING' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(reservation.id)}
              >
                Edit
              </Button>
            )}
            {onCancel && ['PENDING', 'CONFIRMED'].includes(reservation.status) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel(reservation.id)}
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}