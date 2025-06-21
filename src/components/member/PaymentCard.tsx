import { PaymentRecord } from '@/types';
import { formatDate } from '@/utils/format';
import { Button } from '@/components/ui/Button';

interface PaymentCardProps {
  payment: PaymentRecord;
  onPayNow?: (id: string) => void;
  onViewReceipt?: (id: string) => void;
}

export function PaymentCard({ payment, onPayNow, onViewReceipt }: PaymentCardProps) {
  const statusColor = {
    'pending': 'yellow',
    'completed': 'green',
    'failed': 'red',
    'refunded': 'gray',
  }[payment.status];

  const statusText = {
    'pending': 'Pending Payment',
    'completed': 'Paid',
    'failed': 'Payment Failed',
    'refunded': 'Refunded',
  }[payment.status];

  const typeText = {
    'membership': 'Membership Fee',
    'late-fee': 'Late Fee',
    'damage-fee': 'Damage Fee',
    'replacement-fee': 'Replacement Fee',
  }[payment.type];

  const colorClasses = {
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
  };

  const typeIcons = {
    'membership': '👤',
    'late-fee': '⏰',
    'damage-fee': '🔧',
    'replacement-fee': '🔄',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {/* Payment Type Icon */}
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">{typeIcons[payment.type]}</span>
          </div>

          {/* Payment Details */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-gray-900">{typeText}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses[statusColor]}`}>
                {statusText}
              </span>
            </div>
            
            <p className="text-gray-600 mb-2">{payment.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Date:</span>
                <span className="ml-2 font-medium">{formatDate(payment.createdAt)}</span>
              </div>
              <div>
                <span className="text-gray-500">Amount:</span>
                <span className="ml-2 font-medium">${payment.amount.toFixed(2)}</span>
              </div>
              {payment.gstAmount && payment.gstAmount > 0 && (
                <>
                  <div>
                    <span className="text-gray-500">GST:</span>
                    <span className="ml-2 font-medium">${payment.gstAmount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Total:</span>
                    <span className="ml-2 font-bold text-gray-900">${payment.totalAmount.toFixed(2)}</span>
                  </div>
                </>
              )}
              {payment.stripePaymentIntentId && (
                <div className="col-span-2">
                  <span className="text-gray-500">Transaction ID:</span>
                  <span className="ml-2 font-mono text-xs">{payment.stripePaymentIntentId}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {payment.status === 'pending' && onPayNow && (
            <Button
              size="sm"
              onClick={() => onPayNow(payment.id)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Pay Now
            </Button>
          )}
          {payment.status === 'completed' && onViewReceipt && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewReceipt(payment.id)}
            >
              View Receipt
            </Button>
          )}
          {payment.status === 'failed' && onPayNow && (
            <Button
              size="sm"
              onClick={() => onPayNow(payment.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Retry Payment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}