'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsCard } from '@/components/admin/StatsCard';
import { Chart } from '@/components/admin/Chart';
import { MetricsCard } from '@/components/admin/MetricsCard';
import { ActivityFeed, ActivityItem } from '@/components/admin/ActivityFeed';
import { QuickActions, QuickAction } from '@/components/admin/QuickActions';
import { ApiClient } from '@/lib/api';
import { AdminDashboardStats } from '@/types';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await ApiClient.getAdminDashboard();
      setStats(response.data.stats);
      setError(null);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'process-returns',
      title: 'Process Returns',
      description: 'Check in returned tools and process fees',
      href: '/admin/loans/process',
      icon: '📦',
      color: 'blue',
      badge: stats?.loans.active ? { text: `${stats.loans.active}`, color: 'blue' } : undefined
    },
    {
      id: 'approve-members',
      title: 'Approve Members',
      description: 'Review and approve pending memberships',
      href: '/admin/members/approvals',
      icon: '✅',
      color: 'green',
      badge: stats?.reservations.pending ? { text: `${stats.reservations.pending}`, color: 'yellow' } : undefined
    },
    {
      id: 'add-tool',
      title: 'Add Tool',
      description: 'Add new tools to the inventory',
      href: '/admin/tools/new',
      icon: '🔧',
      color: 'purple'
    },
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Create financial and utilization reports',
      href: '/admin/reports',
      icon: '📊',
      color: 'yellow'
    },
    {
      id: 'send-reminders',
      title: 'Send Reminders',
      description: 'Send overdue notifications to members',
      onClick: () => handleSendReminders(),
      icon: '📧',
      color: 'red',
      badge: stats?.loans.overdue ? { text: `${stats.loans.overdue}`, color: 'red' } : undefined,
      disabled: !stats?.loans.overdue || stats.loans.overdue === 0
    },
    {
      id: 'view-activity',
      title: 'View All Activity',
      description: 'See complete system activity log',
      href: '/admin/activity',
      icon: '📋',
      color: 'gray'
    }
  ];

  // Mock activity data - in real implementation, this would come from the API
  const recentActivity: ActivityItem[] = [
    {
      id: '1',
      type: 'registration',
      title: 'New Member Registration',
      description: 'John Smith completed membership application',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      userName: 'John Smith'
    },
    {
      id: '2',
      type: 'checkout',
      title: 'Tool Checked Out',
      description: 'Dewalt Circular Saw checked out',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      userName: 'Sarah Johnson',
      toolName: 'Dewalt Circular Saw'
    },
    {
      id: '3',
      type: 'overdue',
      title: 'Overdue Item Alert',
      description: 'Hammer Drill is 3 days overdue',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      userName: 'Mike Davis',
      toolName: 'Hammer Drill'
    },
    {
      id: '4',
      type: 'payment',
      title: 'Payment Received',
      description: 'Membership renewal payment processed',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      userName: 'Lisa Chen',
      amount: 45.50
    },
    {
      id: '5',
      type: 'return',
      title: 'Tool Returned',
      description: 'Angle Grinder returned in good condition',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      userName: 'Tom Wilson',
      toolName: 'Angle Grinder'
    }
  ];

  const recentActivityData = [
    { label: 'New Registrations', value: 5 },
    { label: 'Tools Checked Out', value: 12 },
    { label: 'Returns Processed', value: 8 },
    { label: 'Overdue Items', value: 3 }
  ];

  const utilizationData = [
    { label: 'Power Tools', value: 85 },
    { label: 'Hand Tools', value: 72 },
    { label: 'Garden Tools', value: 45 },
    { label: 'Electronics', value: 90 },
    { label: 'Automotive', value: 38 }
  ];

  const handleSendReminders = async () => {
    try {
      const response = await ApiClient.sendOverdueReminders();
      alert(`Overdue reminders sent successfully to ${response.data.count} members!`);
      // Refresh dashboard to update counts
      await loadDashboard(true);
    } catch (error) {
      console.error('Failed to send reminders:', error);
      alert('Failed to send reminders. Please try again.');
    }
  };

  const handleRefresh = () => {
    loadDashboard(true);
  };

  const systemMetrics = [
    {
      label: 'System Health',
      value: 'Good',
      color: 'green' as const,
      trend: { direction: 'up' as const, percentage: 5, period: 'last hour' }
    },
    {
      label: 'Database Size',
      value: '2.3 GB',
      color: 'blue' as const
    },
    {
      label: 'Active Sessions',
      value: 24,
      color: 'purple' as const,
      trend: { direction: 'up' as const, percentage: 12, period: 'last hour' }
    }
  ];

  const revenueMetrics = [
    {
      label: 'Total Revenue',
      value: `$${stats?.revenue.thisMonth?.toFixed(2) || '0.00'}`,
      color: 'green' as const,
      trend: { direction: 'up' as const, percentage: 18, period: 'last month' }
    },
    {
      label: 'GST Collected',
      value: `$${(stats?.revenue.thisMonth * 0.1)?.toFixed(2) || '0.00'}`,
      color: 'blue' as const
    },
    {
      label: 'Outstanding Fees',
      value: '$127.50',
      color: 'yellow' as const,
      trend: { direction: 'down' as const, percentage: 8, period: 'last week' }
    }
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Header with refresh button */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
            <p className="text-gray-600">Monitor your tool library&apos;s performance and activity</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshing ? (
              <>
                <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                Refreshing...
              </>
            ) : (
              <>
                <span className="mr-2">🔄</span>
                Refresh
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <span className="text-red-400 mr-2">⚠️</span>
              <div>
                <p className="text-red-800 font-medium">Error Loading Dashboard</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <button 
                  onClick={() => loadDashboard()}
                  className="mt-2 text-red-600 hover:text-red-800 underline text-sm font-medium"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Members"
            value={stats?.users.total || 0}
            icon="👥"
            color="blue"
            loading={loading}
            change={{
              value: 12,
              trend: 'up',
              period: 'last month'
            }}
          />
          <StatsCard
            title="Active Loans"
            value={stats?.loans.active || 0}
            icon="📋"
            color="green"
            loading={loading}
            change={{
              value: 5,
              trend: 'up',
              period: 'last week'
            }}
          />
          <StatsCard
            title="Available Tools"
            value={stats?.tools.available || 0}
            icon="🔧"
            color="purple"
            loading={loading}
          />
          <StatsCard
            title="Overdue Items"
            value={stats?.loans.overdue || 0}
            icon="⚠️"
            color={stats?.loans.overdue && stats.loans.overdue > 0 ? 'red' : 'gray'}
            loading={loading}
            change={{
              value: 25,
              trend: 'down',
              period: 'last week'
            }}
          />
        </div>

        {/* Revenue and Pending Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatsCard
            title="Monthly Revenue"
            value={`$${stats?.revenue.thisMonth?.toFixed(2) || '0.00'}`}
            icon="💰"
            color="green"
            loading={loading}
            change={{
              value: 18,
              trend: 'up',
              period: 'last month'
            }}
          />
          <StatsCard
            title="Active Members"
            value={stats?.users.activeMembers || 0}
            icon="✅"
            color="blue"
            loading={loading}
          />
          <StatsCard
            title="Pending Reservations"
            value={stats?.reservations.pending || 0}
            icon="📅"
            color="yellow"
            loading={loading}
          />
        </div>

        {/* Quick Actions */}
        <QuickActions 
          actions={quickActions}
          title="Quick Actions"
          columns={3}
        />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Chart
            type="bar"
            title="Recent Activity (This Week)"
            data={recentActivityData}
            loading={loading}
            height={250}
          />
          <Chart
            type="bar"
            title="Tool Category Utilization (%)"
            data={utilizationData}
            loading={loading}
            height={250}
          />
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MetricsCard
            title="System Health"
            metrics={systemMetrics}
            loading={loading}
          />
          <MetricsCard
            title="Revenue Breakdown"
            metrics={revenueMetrics}
            loading={loading}
          />
        </div>

        {/* Recent Activity */}
        <ActivityFeed
          activities={recentActivity}
          loading={loading}
          onViewAll={() => router.push('/admin/activity')}
          maxItems={8}
        />
      </div>
    </AdminLayout>
  );
}