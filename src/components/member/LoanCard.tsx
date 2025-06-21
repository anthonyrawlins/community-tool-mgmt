import { Loan } from '@/types';
import { formatDate } from '@/utils/format';
import { Button } from '@/components/ui/Button';

interface LoanCardProps {
  loan: Loan;
  onRenew?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  compact?: boolean;
}

export function LoanCard({ loan, onRenew, onViewDetails, compact = false }: LoanCardProps) {
  const isOverdue = new Date() > new Date(loan.dueDate);
  const daysUntilDue = Math.ceil((new Date(loan.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  const statusColor = {
    'ACTIVE': isOverdue ? 'red' : daysUntilDue <= 3 ? 'yellow' : 'green',
    'RETURNED': 'gray',
    'OVERDUE': 'red',
  }[loan.status];

  const statusText = {
    'ACTIVE': isOverdue ? 'Overdue' : daysUntilDue <= 0 ? 'Due Today' : `Due in ${daysUntilDue} days`,
    'RETURNED': 'Returned',
    'OVERDUE': 'Overdue',
  }[loan.status];

  const colorClasses = {
    red: 'bg-red-50 border-red-200 text-red-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
  };

  return (
    <div className={`border rounded-lg p-4 ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-start gap-4">
        {/* Tool Image */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {loan.tool.imageUrl ? (
              <img
                src={loan.tool.imageUrl}
                alt={loan.tool.name}
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
            {loan.tool.name}
          </h3>
          {(loan.tool.brand || loan.tool.model) && (
            <p className="text-sm text-gray-600 truncate">
              {[loan.tool.brand, loan.tool.model].filter(Boolean).join(' ')}
            </p>
          )}
          
          <div className="mt-2 flex items-center gap-4 text-sm">
            <span className="text-gray-600">
              Borrowed: {formatDate(loan.loanedAt)}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses[statusColor]}`}>
              {statusText}
            </span>
          </div>

          {loan.lateFees && loan.lateFees > 0 && (
            <div className="mt-2 text-sm text-red-600">
              Late fees: ${loan.lateFees.toFixed(2)}
            </div>
          )}
        </div>

        {/* Actions */}
        {!compact && (
          <div className="flex-shrink-0 flex flex-col gap-2">
            {onViewDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(loan.id)}
              >
                Details
              </Button>
            )}
            {onRenew && loan.status === 'ACTIVE' && !isOverdue && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRenew(loan.id)}
              >
                Renew
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}