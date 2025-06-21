'use client';

import { useState, useEffect } from 'react';
import { DashboardData, DashboardStats, Loan, Reservation, PaymentRecord } from '@/types';
import { ApiClient } from '@/lib/api';

export function useDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, we'll fetch data from individual endpoints
      // In a real implementation, you might have a single dashboard endpoint
      const [userResponse, loansResponse, reservationsResponse, paymentsResponse] = await Promise.all([
        ApiClient.getUserProfile(),
        ApiClient.getLoans(1, 5), // Recent loans
        ApiClient.getReservations(1, 5), // Upcoming reservations
        ApiClient.getPayments(1, 5), // Recent payments
      ]);

      // Calculate stats from the data
      const loans = loansResponse.data.loans || [];
      const reservations = reservationsResponse.data.reservations || [];
      const payments = paymentsResponse.data.payments || [];

      const stats: DashboardStats = {
        activeLoans: loans.filter(l => l.status === 'ACTIVE').length,
        overdueLoans: loans.filter(l => l.status === 'OVERDUE' || (l.status === 'ACTIVE' && new Date() > new Date(l.dueDate))).length,
        activeReservations: reservations.filter(r => ['PENDING', 'CONFIRMED'].includes(r.status)).length,
        totalLoansThisMonth: loans.length, // This would need proper filtering in a real app
        outstandingFees: payments
          .filter(p => p.status === 'PENDING' && ['late-fee', 'damage-fee'].includes(p.type))
          .reduce((sum, p) => sum + p.totalAmount, 0),
        membershipExpiresIn: userResponse.data.user.member 
          ? Math.ceil((new Date(userResponse.data.user.member.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : undefined,
      };

      const dashboardData: DashboardData = {
        user: userResponse.data.user,
        stats,
        recentLoans: loans.slice(0, 3),
        upcomingReservations: reservations.slice(0, 3),
        outstandingPayments: payments.filter(p => p.status === 'PENDING'),
      };

      setDashboardData(dashboardData);
    } catch (error) {
      console.error('Dashboard data loading failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return {
    dashboardData,
    loading,
    error,
    refresh: loadDashboardData,
  };
}