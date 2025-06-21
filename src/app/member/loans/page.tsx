'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from "@/components/layout/MainLayout";
import { MemberLayout } from "@/components/member/MemberLayout";
import { LoanCard } from "@/components/member/LoanCard";
import { LoadingCard } from "@/components/member/LoadingCard";
import { useAuth } from "@/hooks/useAuth";
import { ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Loan } from "@/types";
import Link from "next/link";

export default function LoansPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'returned' | 'overdue'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadLoans();
    }
  }, [isAuthenticated, filter]);

  const loadLoans = async (pageNum = 1, reset = true) => {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const response = await ApiClient.getLoans(pageNum, 10);
      const newLoans = response.data.loans || [];

      if (reset) {
        setLoans(newLoans);
      } else {
        setLoans(prev => [...prev, ...newLoans]);
      }

      if (response.data.pagination) {
        setHasMore(pageNum < response.data.pagination.pages);
      }

      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load loans:', error);
      setError(error instanceof Error ? error.message : 'Failed to load loans');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleRenewLoan = async (loanId: string) => {
    try {
      await ApiClient.renewLoan(loanId);
      loadLoans(); // Refresh the list
    } catch (error) {
      console.error('Failed to renew loan:', error);
      // Show error notification
    }
  };

  const filteredLoans = loans.filter(loan => {
    if (filter === 'all') return true;
    if (filter === 'active') return loan.status === 'ACTIVE' && new Date() <= new Date(loan.dueDate);
    if (filter === 'returned') return loan.status === 'RETURNED';
    if (filter === 'overdue') return loan.status === 'OVERDUE' || (loan.status === 'ACTIVE' && new Date() > new Date(loan.dueDate));
    return true;
  });

  const stats = {
    total: loans.length,
    active: loans.filter(l => l.status === 'ACTIVE' && new Date() <= new Date(l.dueDate)).length,
    overdue: loans.filter(l => l.status === 'OVERDUE' || (l.status === 'ACTIVE' && new Date() > new Date(l.dueDate))).length,
    returned: loans.filter(l => l.status === 'RETURNED').length,
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
              <p className="text-blue-600 mb-6">Please log in to view your loan history.</p>
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
                <h3 className="text-2xl font-semibold mb-4 text-red-800">Error Loading Loans</h3>
                <p className="text-red-600 mb-6">{error}</p>
                <Button onClick={() => loadLoans()} className="bg-red-600 hover:bg-red-700 text-white">
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Loans</h1>
              <p className="text-gray-600">
                Manage your current and past tool loans.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Loans</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-700">{stats.active}</div>
                <div className="text-sm text-green-600">Active</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-700">{stats.overdue}</div>
                <div className="text-sm text-red-600">Overdue</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-700">{stats.returned}</div>
                <div className="text-sm text-gray-600">Returned</div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Filter:</span>
                <div className="flex gap-2">
                  {[
                    { key: 'all', label: 'All Loans' },
                    { key: 'active', label: 'Active' },
                    { key: 'overdue', label: 'Overdue' },
                    { key: 'returned', label: 'Returned' },
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

            {/* Loans List */}
            {!loading && (
              <>
                {filteredLoans.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-gray-50 rounded-lg p-12">
                      <div className="text-6xl mb-4">📦</div>
                      <h3 className="text-2xl font-semibold mb-4">
                        {filter === 'all' ? 'No Loans Yet' : `No ${filter} Loans`}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {filter === 'all' 
                          ? "You haven't borrowed any tools yet. Start by browsing our catalog."
                          : `You don't have any ${filter} loans at the moment.`
                        }
                      </p>
                      {filter === 'all' && (
                        <Link href="/catalog">
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            Browse Tool Catalog
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredLoans.map((loan) => (
                      <LoanCard
                        key={loan.id}
                        loan={loan}
                        onRenew={handleRenewLoan}
                        onViewDetails={(id) => {
                          // Navigate to loan details or show modal
                          console.log('View loan details:', id);
                        }}
                      />
                    ))}

                    {/* Load More Button */}
                    {hasMore && !loadingMore && (
                      <div className="text-center pt-6">
                        <Button
                          variant="outline"
                          onClick={() => loadLoans(page + 1, false)}
                        >
                          Load More Loans
                        </Button>
                      </div>
                    )}

                    {/* Loading More Indicator */}
                    {loadingMore && (
                      <div className="text-center py-4">
                        <div className="inline-flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-gray-600">Loading more loans...</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </MemberLayout>
      </div>
    </MainLayout>
  );
}