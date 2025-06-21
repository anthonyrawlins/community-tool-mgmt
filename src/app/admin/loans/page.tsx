'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { ApiClient } from '@/lib/api';
import { AdminLoan, TableFilters, TableSort } from '@/types';

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<AdminLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    loadLoans();
  }, [pagination.page]);

  const loadLoans = async () => {
    try {
      setLoading(true);
      const response = await ApiClient.getAdminLoans({}, undefined, pagination.page, pagination.limit);
      setLoans(response.data.loans);
      if (response.data.pagination) {
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        }));
      }
    } catch (error) {
      console.error('Failed to load loans:', error);
      setError(error instanceof Error ? error.message : 'Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const getStatusBadge = (status: string, dueDate: Date) => {
    const now = new Date();
    const due = new Date(dueDate);
    const isOverdue = status === 'ACTIVE' && due < now;
    
    let color = 'bg-gray-100 text-gray-800';
    let displayStatus = status;
    
    if (isOverdue) {
      color = 'bg-red-100 text-red-800';
      displayStatus = 'OVERDUE';
    } else if (status === 'ACTIVE') {
      color = 'bg-blue-100 text-blue-800';
    } else if (status === 'RETURNED') {
      color = 'bg-green-100 text-green-800';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {displayStatus}
      </span>
    );
  };

  const getDaysOverdue = (dueDate: Date) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = now.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const columns = [
    {
      key: 'id',
      header: 'Loan ID',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm">{value.slice(-8)}</span>
      )
    },
    {
      key: 'user',
      header: 'Member',
      sortable: true,
      render: (value: any, loan: AdminLoan) => (
        <div>
          <div className="font-medium text-gray-900">
            {loan.user.firstName} {loan.user.lastName}
          </div>
          <div className="text-sm text-gray-500">{loan.user.email}</div>
        </div>
      )
    },
    {
      key: 'tool',
      header: 'Tool',
      sortable: true,
      render: (value: any, loan: AdminLoan) => (
        <div>
          <div className="font-medium text-gray-900">{loan.tool.name}</div>
          {loan.tool.brand && loan.tool.model && (
            <div className="text-sm text-gray-500">
              {loan.tool.brand} {loan.tool.model}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'loanedAt',
      header: 'Loaned',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      sortable: true,
      render: (value: string, loan: AdminLoan) => {
        const dueDate = new Date(value);
        const daysOverdue = getDaysOverdue(dueDate);
        const isOverdue = loan.status === 'ACTIVE' && daysOverdue > 0;
        
        return (
          <div>
            <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
              {dueDate.toLocaleDateString()}
            </div>
            {isOverdue && (
              <div className="text-xs text-red-500">
                {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value: string, loan: AdminLoan) => getStatusBadge(value, loan.dueDate)
    },
    {
      key: 'fees',
      header: 'Fees',
      sortable: false,
      render: (value: any, loan: AdminLoan) => {
        const totalFees = (loan.lateFees || 0) + (loan.damageFees || 0);
        return totalFees > 0 ? (
          <div className="text-sm">
            <div className="text-red-600 font-medium">${totalFees.toFixed(2)}</div>
            {loan.lateFees && loan.lateFees > 0 && (
              <div className="text-xs text-gray-500">Late: ${loan.lateFees.toFixed(2)}</div>
            )}
            {loan.damageFees && loan.damageFees > 0 && (
              <div className="text-xs text-gray-500">Damage: ${loan.damageFees.toFixed(2)}</div>
            )}
          </div>
        ) : (
          <span className="text-gray-500">-</span>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (value: any, loan: AdminLoan) => (
        <div className="flex space-x-2">
          {loan.status === 'ACTIVE' ? (
            <a
              href={`/admin/loans/${loan.id}/checkin`}
              className="text-primary hover:text-primary/80 text-sm"
            >
              Check In
            </a>
          ) : (
            <a
              href={`/admin/loans/${loan.id}`}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              View
            </a>
          )}
        </div>
      )
    }
  ];

  const activeLoans = loans.filter(loan => loan.status === 'ACTIVE');
  const overdueLoans = activeLoans.filter(loan => getDaysOverdue(loan.dueDate) > 0);
  const returnedLoans = loans.filter(loan => loan.status === 'RETURNED');
  
  const totalFees = loans.reduce((sum, loan) => 
    sum + (loan.lateFees || 0) + (loan.damageFees || 0), 0
  );

  return (
    <AdminLayout title="Loan Management">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Loan Management</h1>
            <p className="text-gray-600">Process tool loans and returns</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href="/admin/loans/process"
              className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary text-center"
            >
              📦 Process Return
            </a>
            <a
              href="/admin/loans/checkout"
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
            >
              ➕ Check Out Tool
            </a>
            {overdueLoans.length > 0 && (
              <a
                href="/admin/loans/overdue"
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-center"
              >
                ⚠️ Overdue ({overdueLoans.length})
              </a>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-blue-600">{activeLoans.length}</div>
            <div className="text-sm text-gray-500">Active Loans</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-red-600">{overdueLoans.length}</div>
            <div className="text-sm text-gray-500">Overdue</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-green-600">{returnedLoans.length}</div>
            <div className="text-sm text-gray-500">Returned Today</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-yellow-600">${totalFees.toFixed(2)}</div>
            <div className="text-sm text-gray-500">Outstanding Fees</div>
          </div>
        </div>

        {/* Quick Actions */}
        {overdueLoans.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-red-900">
                  Overdue Items Require Attention
                </h3>
                <p className="text-red-700">
                  {overdueLoans.length} item{overdueLoans.length !== 1 ? 's are' : ' is'} overdue
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={async () => {
                    try {
                      await ApiClient.processOverdueLoans();
                      await loadLoans();
                    } catch (error) {
                      console.error('Failed to process overdue loans:', error);
                      setError('Failed to process overdue loans');
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Send Reminders
                </button>
                <a
                  href="/admin/loans/overdue"
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-md text-sm font-medium hover:bg-red-50"
                >
                  Manage Overdue
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Loans Table */}
        <DataTable
          data={loans}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          searchable={true}
          rowId="id"
          emptyMessage="No loans found."
        />
      </div>
    </AdminLayout>
  );
}