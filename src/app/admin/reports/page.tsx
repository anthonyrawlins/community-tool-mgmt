'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsCard } from '@/components/admin/StatsCard';
import { Chart } from '@/components/admin/Chart';
import { FormField } from '@/components/admin/FormField';
import { ApiClient } from '@/lib/api';
import { RevenueReport, UtilizationReport, MemberAnalytics } from '@/types';

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null);
  const [utilizationReport, setUtilizationReport] = useState<UtilizationReport | null>(null);
  const [memberAnalytics, setMemberAnalytics] = useState<MemberAnalytics | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [revenueRes, utilizationRes, memberRes] = await Promise.all([
        ApiClient.getRevenueReport(dateRange.startDate, dateRange.endDate),
        ApiClient.getUtilizationReport(dateRange.startDate, dateRange.endDate),
        ApiClient.getMemberAnalytics(dateRange.startDate, dateRange.endDate)
      ]);
      
      setRevenueReport(revenueRes.data.report);
      setUtilizationReport(utilizationRes.data.report);
      setMemberAnalytics(memberRes.data.report);
    } catch (error) {
      console.error('Failed to load reports:', error);
      setError(error instanceof Error ? error.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleRefresh = () => {
    loadReports();
  };

  const handleExport = async (type: string, format: string) => {
    try {
      const blob = await ApiClient.exportReport(type, format, dateRange.startDate, dateRange.endDate);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report-${dateRange.startDate}-to-${dateRange.endDate}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      setError(error instanceof Error ? error.message : 'Export failed');
    }
  };

  const quickReports = [
    {
      title: 'Revenue Report',
      description: 'Income tracking with GST breakdown',
      icon: '💰',
      href: '/admin/reports/revenue'
    },
    {
      title: 'Tool Utilization',
      description: 'Most and least used tools',
      icon: '📊',
      href: '/admin/reports/utilization'
    },
    {
      title: 'Member Analytics',
      description: 'Membership trends and retention',
      icon: '👥',
      href: '/admin/reports/members'
    },
    {
      title: 'Tax Compliance',
      description: 'Australian GST reporting',
      icon: '🧾',
      href: '/admin/reports/tax'
    }
  ];

  // Prepare chart data
  const revenueChartData = revenueReport?.monthlyData?.map(data => ({
    label: data.month,
    value: data.revenue
  })) || [];

  const utilizationChartData = utilizationReport?.topTools?.slice(0, 10).map(item => ({
    label: item.tool.name,
    value: item.loanCount
  })) || [];

  const membershipBreakdownData = memberAnalytics ? [
    { label: 'Basic Members', value: memberAnalytics.membershipBreakdown.basic },
    { label: 'Premium Members', value: memberAnalytics.membershipBreakdown.premium }
  ] : [];

  return (
    <AdminLayout title="Reports & Analytics">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Header with Date Range */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600">Financial and operational insights</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex gap-2">
                <FormField
                  label="Start Date"
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                  className="w-auto"
                />
                <FormField
                  label="End Date"
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                  className="w-auto"
                />
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Report Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickReports.map((report) => (
            <a
              key={report.title}
              href={report.href}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-gray-200"
            >
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">{report.icon}</span>
                <h3 className="font-medium text-gray-900">{report.title}</h3>
              </div>
              <p className="text-sm text-gray-500">{report.description}</p>
            </a>
          ))}
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Revenue"
            value={`$${revenueReport?.totalRevenue.toFixed(2) || '0.00'}`}
            icon="💰"
            color="green"
            loading={loading}
          />
          <StatsCard
            title="GST Collected"
            value={`$${revenueReport?.gstCollected.toFixed(2) || '0.00'}`}
            icon="🧾"
            color="blue"
            loading={loading}
          />
          <StatsCard
            title="New Members"
            value={memberAnalytics?.newMembers || 0}
            icon="👥"
            color="purple"
            loading={loading}
          />
          <StatsCard
            title="Member Retention"
            value={`${memberAnalytics?.retentionRate.toFixed(1) || '0.0'}%`}
            icon="📈"
            color="yellow"
            loading={loading}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Chart
            type="bar"
            title="Monthly Revenue"
            data={revenueChartData}
            loading={loading}
            height={300}
          />
          
          <Chart
            type="bar"
            title="Top 10 Most Used Tools"
            data={utilizationChartData}
            loading={loading}
            height={300}
          />
        </div>

        {/* Revenue Breakdown */}
        {revenueReport && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Revenue Breakdown</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('revenue', 'pdf')}
                  className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  📄 PDF
                </button>
                <button
                  onClick={() => handleExport('revenue', 'csv')}
                  className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  📊 CSV
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    ${revenueReport.paymentBreakdown.membership.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">Membership Fees</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    ${revenueReport.paymentBreakdown.lateFees.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">Late Fees</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    ${revenueReport.paymentBreakdown.damageFees.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">Damage Fees</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    ${revenueReport.paymentBreakdown.replacementFees.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">Replacement Fees</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Membership Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Membership Breakdown</h2>
            </div>
            <div className="p-6">
              <Chart
                type="pie"
                data={membershipBreakdownData}
                loading={loading}
                height={250}
                showLegend={true}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Tool Performance</h2>
            </div>
            <div className="p-6">
              {utilizationReport?.topTools ? (
                <div className="space-y-3">
                  {utilizationReport.topTools.slice(0, 5).map((tool, index) => (
                    <div key={tool.tool.id} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">{tool.tool.name}</div>
                        <div className="text-sm text-gray-500">{tool.tool.brand} {tool.tool.model}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{tool.loanCount} loans</div>
                        <div className="text-sm text-gray-500">${tool.revenue.toFixed(2)} revenue</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  {loading ? 'Loading...' : 'No data available'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Export Reports</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => handleExport('comprehensive', 'pdf')}
              className="p-4 border border-gray-300 rounded-lg text-center hover:bg-white transition-colors"
            >
              <div className="text-2xl mb-2">📄</div>
              <div className="font-medium">Comprehensive PDF</div>
              <div className="text-sm text-gray-500">All reports combined</div>
            </button>
            <button
              onClick={() => handleExport('financial', 'xlsx')}
              className="p-4 border border-gray-300 rounded-lg text-center hover:bg-white transition-colors"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">Financial Excel</div>
              <div className="text-sm text-gray-500">For accounting software</div>
            </button>
            <button
              onClick={() => handleExport('tax', 'pdf')}
              className="p-4 border border-gray-300 rounded-lg text-center hover:bg-white transition-colors"
            >
              <div className="text-2xl mb-2">🧾</div>
              <div className="font-medium">Tax Report</div>
              <div className="text-sm text-gray-500">GST compliance</div>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}