'use client';

import { useState } from 'react';
import { MainLayout } from "@/components/layout/MainLayout";
import { MemberLayout } from "@/components/member/MemberLayout";
import { StatsCard } from "@/components/member/StatsCard";
import { LoanCard } from "@/components/member/LoanCard";
import { ReservationCard } from "@/components/member/ReservationCard";
import { MembershipStatusCard } from "@/components/member/MembershipStatusCard";
import { QuickReservationForm } from "@/components/member/QuickReservationForm";
import { LoadingCard, LoadingGrid } from "@/components/member/LoadingCard";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function MemberPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { dashboardData, loading: dashboardLoading, error, refresh } = useDashboard();
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});

  const handleRenewLoan = async (loanId: string) => {
    setActionLoading(prev => ({ ...prev, [`loan-${loanId}`]: true }));
    try {
      await ApiClient.renewLoan(loanId);
      refresh(); // Refresh dashboard data
    } catch (error) {
      console.error('Failed to renew loan:', error);
      // Here you would typically show a toast notification
    } finally {
      setActionLoading(prev => ({ ...prev, [`loan-${loanId}`]: false }));
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    setActionLoading(prev => ({ ...prev, [`reservation-${reservationId}`]: true }));
    try {
      await ApiClient.cancelReservation(reservationId);
      refresh(); // Refresh dashboard data
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [`reservation-${reservationId}`]: false }));
    }
  };

  const handleReservationSuccess = () => {
    refresh(); // Refresh dashboard data
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <LoadingGrid count={6} />
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show login required if not authenticated
  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Member Portal</h1>
            <p className="text-xl text-gray-600">
              Access your dashboard, manage bookings, and view your account information.
            </p>
          </div>

          {/* Login Required Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-2">
              Login Required
            </h2>
            <p className="text-blue-800 mb-4">
              Please log in to access your member dashboard and view your bookings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Log In to Your Account
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-blue-600 bg-white rounded-md font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Don&apos;t have an account? Join Now
              </Link>
            </div>
          </div>

          {/* Member Dashboard Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Current Loans</h3>
              <p className="text-gray-600 mb-4">
                View and manage your active tool loans and due dates.
              </p>
              <div className="text-sm text-gray-500">
                Available after login
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Reservations</h3>
              <p className="text-gray-600 mb-4">
                Manage your tool reservations and pickup schedules.
              </p>
              <div className="text-sm text-gray-500">
                Available after login
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Profile & Settings</h3>
              <p className="text-gray-600 mb-4">
                Update your personal information and preferences.
              </p>
              <div className="text-sm text-gray-500">
                Available after login
              </div>
            </div>
          </div>

          {/* Help and Support */}
          <div className="mt-12 bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Need Help?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Contact Support</h3>
                <p className="text-gray-600 mb-4">
                  Our friendly team is here to help with any questions about your membership or bookings.
                </p>
                <Link
                  href="/contact"
                  className="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm"
                >
                  Get Support →
                </Link>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Frequently Asked Questions</h3>
                <p className="text-gray-600 mb-4">
                  Find answers to common questions about tool borrowing, membership, and policies.
                </p>
                <Link
                  href="/faq"
                  className="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm"
                >
                  View FAQ →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show error state if dashboard loading failed
  if (error && !dashboardLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <MemberLayout>
            <div className="text-center py-16">
              <div className="bg-red-50 border border-red-200 rounded-lg p-12">
                <h3 className="text-2xl font-semibold mb-4 text-red-800">Error Loading Dashboard</h3>
                <p className="text-red-600 mb-6">{error}</p>
                <Button onClick={refresh} className="bg-red-600 hover:bg-red-700 text-white">
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
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-gray-600">
                Here&apos;s an overview of your tool library activity.
              </p>
            </div>

            {/* Loading State */}
            {dashboardLoading && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <LoadingCard key={i} />
                  ))}
                </div>
                <LoadingGrid count={3} />
              </div>
            )}

            {/* Dashboard Content */}
            {!dashboardLoading && dashboardData && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatsCard
                    title="Active Loans"
                    value={dashboardData.stats.activeLoans}
                    icon="📦"
                    color="blue"
                    description={`${dashboardData.stats.overdueLoans} overdue`}
                  />
                  <StatsCard
                    title="Active Reservations"
                    value={dashboardData.stats.activeReservations}
                    icon="📅"
                    color="green"
                  />
                  <StatsCard
                    title="This Month"
                    value={dashboardData.stats.totalLoansThisMonth}
                    icon="📊"
                    color="gray"
                    description="Tools borrowed"
                  />
                  <StatsCard
                    title="Outstanding Fees"
                    value={`$${dashboardData.stats.outstandingFees.toFixed(2)}`}
                    icon="💳"
                    color={dashboardData.stats.outstandingFees > 0 ? "red" : "green"}
                  />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Membership Status */}
                    {dashboardData.user.member && (
                      <MembershipStatusCard
                        member={dashboardData.user.member}
                        onRenew={() => {
                          // Handle membership renewal
                          console.log('Renew membership');
                        }}
                      />
                    )}

                    {/* Current Loans */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Current Loans</h2>
                        <Link href="/member/loans">
                          <Button variant="outline" size="sm">
                            View All
                          </Button>
                        </Link>
                      </div>
                      
                      {dashboardData.recentLoans.length === 0 ? (
                        <p className="text-gray-600 text-center py-8">
                          No active loans. 
                          <Link href="/catalog" className="text-blue-600 hover:text-blue-800 ml-1">
                            Browse our catalog
                          </Link> to get started.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {dashboardData.recentLoans.map((loan) => (
                            <LoanCard
                              key={loan.id}
                              loan={loan}
                              onRenew={handleRenewLoan}
                              onViewDetails={(id) => console.log('View loan details:', id)}
                              compact={true}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Quick Reservation */}
                    <QuickReservationForm
                      onSuccess={handleReservationSuccess}
                      onError={(error) => console.error('Reservation error:', error)}
                    />

                    {/* Upcoming Reservations */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Upcoming Reservations</h2>
                        <Link href="/member/reservations">
                          <Button variant="outline" size="sm">
                            View All
                          </Button>
                        </Link>
                      </div>
                      
                      {dashboardData.upcomingReservations.length === 0 ? (
                        <p className="text-gray-600 text-center py-8">
                          No upcoming reservations.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {dashboardData.upcomingReservations.map((reservation) => (
                            <ReservationCard
                              key={reservation.id}
                              reservation={reservation}
                              onCancel={handleCancelReservation}
                              onEdit={(id) => console.log('Edit reservation:', id)}
                              compact={true}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Outstanding Payments */}
                    {dashboardData.outstandingPayments.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-red-800 mb-4">Outstanding Payments</h2>
                        <div className="space-y-3">
                          {dashboardData.outstandingPayments.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-red-800">{payment.description}</p>
                                <p className="text-sm text-red-600">${payment.totalAmount.toFixed(2)}</p>
                              </div>
                              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                                Pay Now
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </MemberLayout>
      </div>
    </MainLayout>
  );
}