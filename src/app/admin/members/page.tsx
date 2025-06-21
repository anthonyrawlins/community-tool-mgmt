'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { ApiClient } from '@/lib/api';
import { AdminUser, TableColumn } from '@/types';

export default function AdminMembersPage() {
  const [members, setMembers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await ApiClient.getAdminUsers();
      setMembers(response.data.users);
    } catch (error) {
      console.error('Failed to load members:', error);
      setError(error instanceof Error ? error.message : 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId: string, reason: string) => {
    try {
      await ApiClient.suspendUser(userId, reason);
      await loadMembers();
    } catch (error) {
      console.error('Failed to suspend user:', error);
      setError(error instanceof Error ? error.message : 'Failed to suspend user');
    }
  };

  const handleReactivateUser = async (userId: string) => {
    try {
      await ApiClient.reactivateUser(userId);
      await loadMembers();
    } catch (error) {
      console.error('Failed to reactivate user:', error);
      setError(error instanceof Error ? error.message : 'Failed to reactivate user');
    }
  };

  const getMembershipStatusBadge = (status: string) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'expired': 'bg-yellow-100 text-yellow-800',
      'suspended': 'bg-red-100 text-red-800',
      'pending': 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTierBadge = (tier: string) => {
    const colors = {
      'basic': 'bg-blue-100 text-blue-800',
      'premium': 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[tier as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </span>
    );
  };

  const columns: TableColumn<AdminUser>[] = [
    {
      key: 'name',
      header: 'Member',
      sortable: true,
      render: (value: unknown, member: AdminUser) => (
        <div>
          <div className="font-medium text-gray-900">
            {member.firstName} {member.lastName}
          </div>
          <div className="text-sm text-gray-500">{member.email}</div>
          {member.member?.membershipNumber && (
            <div className="text-xs text-gray-400">#{member.member.membershipNumber}</div>
          )}
        </div>
      )
    },
    {
      key: 'membershipStatus',
      header: 'Status',
      sortable: true,
      render: (value: unknown) => getMembershipStatusBadge(String(value))
    },
    {
      key: 'membershipType',
      header: 'Tier',
      sortable: true,
      render: (value: string, member: AdminUser) => {
        const tier = member.member?.tier || member.membershipType;
        return getTierBadge(tier);
      }
    },
    {
      key: 'membershipExpiry',
      header: 'Expires',
      sortable: true,
      render: (value: unknown, member: AdminUser) => {
        const expiry = member.member?.expiresAt || member.membershipExpiry;
        if (!expiry) return '-';
        
        const date = new Date(expiry);
        const now = new Date();
        const isExpired = date < now;
        const daysUntilExpiry = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        return (
          <div>
            <div className={isExpired ? 'text-red-600' : daysUntilExpiry < 30 ? 'text-yellow-600' : 'text-gray-900'}>
              {date.toLocaleDateString()}
            </div>
            {!isExpired && (
              <div className="text-xs text-gray-500">
                {daysUntilExpiry} days left
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'activity',
      header: 'Activity',
      sortable: false,
      render: (value: unknown, member: AdminUser) => (
        <div className="text-sm">
          <div>Loans: {member._count?.loans || 0}</div>
          <div>Reservations: {member._count?.reservations || 0}</div>
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Contact',
      sortable: false,
      render: (value: string, member: AdminUser) => (
        <div className="text-sm">
          {member.phone && <div>{member.phone}</div>}
          {member.address && (
            <div className="text-gray-500">
              {typeof member.address === 'string' ? member.address : 
               `${member.address.city}, ${member.address.state}`}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (value: unknown, member: AdminUser) => (
        <div className="flex space-x-2">
          <a
            href={`/admin/members/${member.id}`}
            className="text-primary hover:text-primary/80 text-sm"
          >
            View
          </a>
          {member.membershipStatus === 'suspended' ? (
            <button
              onClick={() => handleReactivateUser(member.id)}
              className="text-green-500 hover:text-green-700 text-sm"
            >
              Reactivate
            </button>
          ) : (
            <button
              onClick={() => {
                const reason = prompt('Reason for suspension:');
                if (reason) handleSuspendUser(member.id, reason);
              }}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Suspend
            </button>
          )}
        </div>
      )
    }
  ];

  const bulkActions = [
    { label: 'Send Email', value: 'send-email', icon: '📧' },
    { label: 'Renew Membership', value: 'renew-membership', icon: '🔄' },
    { label: 'Export Selected', value: 'export-selected', icon: '📤' }
  ];

  const stats = {
    total: members.length,
    active: members.filter(m => m.membershipStatus === 'active').length,
    expired: members.filter(m => m.membershipStatus === 'expired').length,
    suspended: members.filter(m => m.membershipStatus === 'suspended').length,
    pending: members.filter(m => m.membershipStatus === 'pending').length,
    basic: members.filter(m => (m.member?.tier || m.membershipType) === 'basic').length,
    premium: members.filter(m => (m.member?.tier || m.membershipType) === 'premium').length
  };

  return (
    <AdminLayout title="Member Management">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Members</h1>
            <p className="text-gray-600">Manage member accounts and memberships</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href="/admin/members/approvals"
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
            >
              ✅ Pending Approvals ({stats.pending})
            </a>
            <a
              href="/admin/members/renewals"
              className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-center"
            >
              🔄 Expiring Soon
            </a>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-500">Active</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-yellow-600">{stats.expired}</div>
            <div className="text-sm text-gray-500">Expired</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
            <div className="text-sm text-gray-500">Suspended</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-blue-600">{stats.basic}</div>
            <div className="text-sm text-gray-500">Basic</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-purple-600">{stats.premium}</div>
            <div className="text-sm text-gray-500">Premium</div>
          </div>
        </div>

        {/* Members Table */}
        <DataTable
          data={members}
          columns={columns}
          loading={loading}
          searchable={true}
          selectable={true}
          bulkActions={bulkActions}
          rowId="id"
          emptyMessage="No members found."
        />
      </div>
    </AdminLayout>
  );
}