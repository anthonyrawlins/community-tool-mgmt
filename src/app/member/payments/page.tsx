'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from "@/components/layout/MainLayout";
import { MemberLayout } from "@/components/member/MemberLayout";
import { PaymentCard } from "@/components/member/PaymentCard";
import { LoadingCard } from "@/components/member/LoadingCard";
import { useAuth } from "@/hooks/useAuth";
import { ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { PaymentRecord } from "@/types";
import Link from "next/link";

export default function PaymentsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed' | 'refunded'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadPayments();
    }
  }, [isAuthenticated, filter]);

  const loadPayments = async (pageNum = 1, reset = true) => {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const response = await ApiClient.getPayments(pageNum, 10);
      const newPayments = response.data.payments || [];

      if (reset) {
        setPayments(newPayments);
      } else {
        setPayments(prev => [...prev, ...newPayments]);
      }

      if (response.data.pagination) {
        setHasMore(pageNum < response.data.pagination.pages);
      }

      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load payments:', error);
      setError(error instanceof Error ? error.message : 'Failed to load payments');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handlePayNow = async (paymentId: string) => {
    try {
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) return;

      const response = await ApiClient.createPaymentSession(
        payment.totalAmount,
        payment.type,
        payment.description
      );

      // In a real implementation, redirect to Stripe checkout
      console.log('Payment session created:', response.data);
      
      // For demo purposes, just refresh the payments
      loadPayments();
    } catch (error) {
      console.error('Failed to initiate payment:', error);
      // Show error notification
    }
  };

  const handleViewReceipt = (paymentId: string) => {
    // In a real app, this would show a receipt modal or download PDF
    console.log('View receipt for payment:', paymentId);
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status === filter;
  });

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    completed: payments.filter(p => p.status === 'completed').length,
    failed: payments.filter(p => p.status === 'failed').length,
    totalAmount: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.totalAmount, 0),
    outstandingAmount: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.totalAmount, 0),
  };

  if (authLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-12">
              <h3 className="text-2xl font-semibold mb-4 text-blue-800">Authentication Required</h3>
              <p className="text-blue-600 mb-6">Please log in to view your payment history.</p>
              <Link href="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error && !loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <MemberLayout>
            <div className="text-center py-16">
              <div className="bg-red-50 border border-red-200 rounded-lg p-12">
                <h3 className="text-2xl font-semibold mb-4 text-red-800">Error Loading Payments</h3>
                <p className="text-red-600 mb-6">{error}</p>
                <Button onClick={() => loadPayments()} className="bg-red-600 hover:bg-red-700 text-white">
                  Try Again
                </Button>
              </div>
            </div>
          </MemberLayout>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <MemberLayout>
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment History</h1>
              <p className="text-gray-600">
                View your membership payments, fees, and transaction history.
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Transactions</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-700">${stats.totalAmount.toFixed(2)}</div>
                <div className="text-sm text-green-600">Total Paid</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-700">${stats.outstandingAmount.toFixed(2)}</div>
                <div className="text-sm text-yellow-600">Outstanding</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-700">{stats.completed}</div>
                <div className="text-sm text-blue-600">Completed</div>
              </div>
            </div>

            {/* Outstanding Payments Alert */}
            {stats.outstandingAmount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div>
                    <h3 className="font-semibold text-yellow-800">Outstanding Payments</h3>
                    <p className="text-yellow-700">
                      You have ${stats.outstandingAmount.toFixed(2)} in pending payments. 
                      Please complete these payments to maintain your membership status.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Filter:</span>
                <div className="flex gap-2">
                  {[
                    { key: 'all', label: 'All Payments' },
                    { key: 'pending', label: 'Pending' },
                    { key: 'completed', label: 'Completed' },
                    { key: 'failed', label: 'Failed' },
                    { key: 'refunded', label: 'Refunded' },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key as any)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        filter === key
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <LoadingCard key={i} />
                ))}
              </div>
            )}

            {/* Payments List */}
            {!loading && (
              <>
                {filteredPayments.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-gray-50 rounded-lg p-12">
                      <div className="text-6xl mb-4">💳</div>
                      <h3 className="text-2xl font-semibold mb-4">
                        {filter === 'all' ? 'No Payments Yet' : `No ${filter} Payments`}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {filter === 'all' 
                          ? "You haven't made any payments yet. Payments will appear here when you make membership payments or pay fees."
                          : `You don't have any ${filter} payments at the moment.`
                        }
                      </p>
                      {filter === 'all' && (
                        <Link href="/member">
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            Back to Dashboard
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPayments.map((payment) => (
                      <PaymentCard
                        key={payment.id}
                        payment={payment}
                        onPayNow={handlePayNow}
                        onViewReceipt={handleViewReceipt}
                      />
                    ))}

                    {/* Load More Button */}
                    {hasMore && !loadingMore && (
                      <div className="text-center pt-6">
                        <Button
                          variant="outline"
                          onClick={() => loadPayments(page + 1, false)}
                        >
                          Load More Payments
                        </Button>
                      </div>
                    )}

                    {/* Loading More Indicator */}
                    {loadingMore && (
                      <div className="text-center py-4">
                        <div className="inline-flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-gray-600">Loading more payments...</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* GST Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Australian GST Information</h3>
              <p className="text-sm text-gray-600 mb-2">
                All payments include 10% GST as required by Australian tax law. 
                GST amounts are shown separately for your records.
              </p>
              <p className="text-sm text-gray-600">
                For tax purposes, you can download detailed receipts for all completed payments.
              </p>
            </div>
          </div>
        </MemberLayout>
      </div>
    </MainLayout>
  );
}