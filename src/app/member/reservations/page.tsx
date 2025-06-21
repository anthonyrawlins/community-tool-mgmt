'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from "@/components/layout/MainLayout";
import { MemberLayout } from "@/components/member/MemberLayout";
import { ReservationCard } from "@/components/member/ReservationCard";
import { QuickReservationForm } from "@/components/member/QuickReservationForm";
import { LoadingCard } from "@/components/member/LoadingCard";
import { useAuth } from "@/hooks/useAuth";
import { ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Reservation } from "@/types";
import Link from "next/link";

export default function ReservationsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showReservationForm, setShowReservationForm] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadReservations();
    }
  }, [isAuthenticated, filter]);

  const loadReservations = async (pageNum = 1, reset = true) => {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const response = await ApiClient.getReservations(pageNum, 10);
      const newReservations = response.data.reservations || [];

      if (reset) {
        setReservations(newReservations);
      } else {
        setReservations(prev => [...prev, ...newReservations]);
      }

      if (response.data.pagination) {
        setHasMore(pageNum < response.data.pagination.pages);
      }

      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load reservations:', error);
      setError(error instanceof Error ? error.message : 'Failed to load reservations');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      await ApiClient.cancelReservation(reservationId);
      loadReservations(); // Refresh the list
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
      // Show error notification
    }
  };

  const handleEditReservation = (reservationId: string) => {
    // In a real app, this would open an edit modal or navigate to edit page
    console.log('Edit reservation:', reservationId);
  };

  const handleReservationSuccess = () => {
    setShowReservationForm(false);
    loadReservations(); // Refresh the list
  };

  const filteredReservations = reservations.filter(reservation => {
    if (filter === 'all') return true;
    return reservation.status.toLowerCase() === filter;
  });

  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'PENDING').length,
    confirmed: reservations.filter(r => r.status === 'CONFIRMED').length,
    completed: reservations.filter(r => r.status === 'COMPLETED').length,
    cancelled: reservations.filter(r => r.status === 'CANCELLED').length,
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
              <p className="text-blue-600 mb-6">Please log in to view your reservations.</p>
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
                <h3 className="text-2xl font-semibold mb-4 text-red-800">Error Loading Reservations</h3>
                <p className="text-red-600 mb-6">{error}</p>
                <Button onClick={() => loadReservations()} className="bg-red-600 hover:bg-red-700 text-white">
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reservations</h1>
                <p className="text-gray-600">
                  Manage your tool reservations and pickup schedules.
                </p>
              </div>
              <Button 
                onClick={() => setShowReservationForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                New Reservation
              </Button>
            </div>

            {/* New Reservation Form */}
            {showReservationForm && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Create New Reservation</h2>
                  <button
                    onClick={() => setShowReservationForm(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    ✕
                  </button>
                </div>
                <QuickReservationForm
                  onSuccess={handleReservationSuccess}
                  onError={(error) => console.error('Reservation error:', error)}
                />
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
                <div className="text-sm text-yellow-600">Pending</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-700">{stats.confirmed}</div>
                <div className="text-sm text-blue-600">Confirmed</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
                <div className="text-sm text-green-600">Completed</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-700">{stats.cancelled}</div>
                <div className="text-sm text-gray-600">Cancelled</div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Filter:</span>
                <div className="flex gap-2">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'pending', label: 'Pending' },
                    { key: 'confirmed', label: 'Confirmed' },
                    { key: 'completed', label: 'Completed' },
                    { key: 'cancelled', label: 'Cancelled' },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key as 'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed')}
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

            {/* Reservations List */}
            {!loading && (
              <>
                {filteredReservations.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-gray-50 rounded-lg p-12">
                      <div className="text-6xl mb-4">📅</div>
                      <h3 className="text-2xl font-semibold mb-4">
                        {filter === 'all' ? 'No Reservations Yet' : `No ${filter} Reservations`}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {filter === 'all' 
                          ? "You haven't made any reservations yet. Reserve tools in advance to ensure availability."
                          : `You don't have any ${filter} reservations at the moment.`
                        }
                      </p>
                      {filter === 'all' && (
                        <div className="flex gap-4 justify-center">
                          <Button 
                            onClick={() => setShowReservationForm(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Make a Reservation
                          </Button>
                          <Link href="/catalog">
                            <Button variant="outline">
                              Browse Tools
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredReservations.map((reservation) => (
                      <ReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        onCancel={handleCancelReservation}
                        onEdit={handleEditReservation}
                        onViewDetails={(id) => {
                          // Navigate to reservation details or show modal
                          console.log('View reservation details:', id);
                        }}
                      />
                    ))}

                    {/* Load More Button */}
                    {hasMore && !loadingMore && (
                      <div className="text-center pt-6">
                        <Button
                          variant="outline"
                          onClick={() => loadReservations(page + 1, false)}
                        >
                          Load More Reservations
                        </Button>
                      </div>
                    )}

                    {/* Loading More Indicator */}
                    {loadingMore && (
                      <div className="text-center py-4">
                        <div className="inline-flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-gray-600">Loading more reservations...</span>
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