import { Member } from '@/types';
import { formatDate } from '@/utils/format';
import { Button } from '@/components/ui/Button';

interface MembershipStatusCardProps {
  member: Member;
  onRenew?: () => void;
}

export function MembershipStatusCard({ member, onRenew }: MembershipStatusCardProps) {
  const expiresAt = new Date(member.expiresAt);
  const today = new Date();
  const daysUntilExpiry = Math.ceil((expiresAt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const isExpired = daysUntilExpiry < 0;
  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  
  const statusColor = isExpired ? 'red' : isExpiringSoon ? 'yellow' : 'green';
  const statusText = isExpired 
    ? 'Expired' 
    : isExpiringSoon 
      ? `Expires in ${daysUntilExpiry} days`
      : 'Active';

  const colorClasses = {
    red: 'bg-red-50 border-red-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    green: 'bg-green-50 border-green-200',
  };

  const textColorClasses = {
    red: 'text-red-700',
    yellow: 'text-yellow-700',
    green: 'text-green-700',
  };

  return (
    <div className={`border rounded-lg p-6 ${colorClasses[statusColor]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Membership Status</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses[statusColor]} ${textColorClasses[statusColor]}`}>
              {statusText}
            </span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Member Number:</span>
              <span className="font-medium">{member.membershipNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tier:</span>
              <span className="font-medium capitalize">{member.tier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expires:</span>
              <span className="font-medium">{formatDate(member.expiresAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Max Loans:</span>
              <span className="font-medium">{member.maxLoans}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Max Reservations:</span>
              <span className="font-medium">{member.maxReservations}</span>
            </div>
          </div>
        </div>
        
        <div className="text-4xl opacity-60">👤</div>
      </div>

      {(isExpired || isExpiringSoon) && onRenew && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button onClick={onRenew} className="w-full">
            {isExpired ? 'Renew Membership' : 'Renew Early'}
          </Button>
        </div>
      )}
    </div>
  );
}