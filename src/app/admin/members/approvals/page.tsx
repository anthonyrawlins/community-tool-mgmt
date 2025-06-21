'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { FormField } from '@/components/admin/FormField';
import { ApiClient } from '@/lib/api';
import { AdminUser, MembershipApprovalForm } from '@/types';

export default function MembershipApprovalsPage() {
  const [pendingMembers, setPendingMembers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadPendingMembers();
  }, []);

  const loadPendingMembers = async () => {
    try {
      setLoading(true);
      const response = await ApiClient.getPendingMemberships();
      setPendingMembers(response.data.users);
    } catch (error) {
      console.error('Failed to load pending members:', error);
      setError(error instanceof Error ? error.message : 'Failed to load pending members');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId: string, approved: boolean, tier: string, notes?: string) => {
    setProcessingId(userId);
    
    try {
      const approvalData: MembershipApprovalForm = {
        userId,
        approved,
        tier: tier as 'basic' | 'premium',
        notes
      };
      
      await ApiClient.approveMembership(approvalData);
      await loadPendingMembers();
    } catch (error) {
      console.error('Failed to process approval:', error);
      setError(error instanceof Error ? error.message : 'Failed to process approval');
    } finally {
      setProcessingId(null);
    }
  };

  const ApprovalCard = ({ member }: { member: AdminUser }) => {
    const [selectedTier, setSelectedTier] = useState<string>('basic');
    const [notes, setNotes] = useState('');
    const [showDetails, setShowDetails] = useState(false);

    const handleApprove = () => {
      handleApproval(member.id, true, selectedTier, notes);
    };

    const handleReject = () => {
      const reason = prompt('Please provide a reason for rejection:');
      if (reason) {
        handleApproval(member.id, false, 'basic', reason);
      }
    };

    return (
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {member.firstName} {member.lastName}
              </h3>
              <p className="text-sm text-gray-500">{member.email}</p>
              <p className="text-xs text-gray-400">
                Registered: {new Date(member.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-primary hover:text-primary/80 text-sm"
              >
                {showDetails ? 'Hide' : 'Show'} Details
              </button>
            </div>
          </div>

          {showDetails && (
            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Phone:</strong> {member.phone || 'Not provided'}
                </div>
                <div>
                  <strong>Requested Tier:</strong> {member.membershipType}
                </div>
                <div className="md:col-span-2">
                  <strong>Address:</strong>{' '}
                  {typeof member.address === 'string' 
                    ? member.address 
                    : member.address 
                      ? `${member.address.street}, ${member.address.city}, ${member.address.state} ${member.address.postcode}`
                      : 'Not provided'
                  }
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <FormField
              label="Approved Membership Tier"
              type="select"
              name="tier"
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              options={[
                { label: 'Basic Membership', value: 'basic' },
                { label: 'Premium Membership', value: 'premium' }
              ]}
              helpText="Select the membership tier to grant"
            />

            <FormField
              label="Notes (Optional)"
              type="textarea"
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this approval..."
              rows={2}
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleReject}
                disabled={processingId === member.id}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-md text-sm font-medium hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={handleApprove}
                disabled={processingId === member.id}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {processingId === member.id ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout title="Membership Approvals">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Membership Approvals">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Membership Approvals</h1>
            <p className="text-gray-600">
              Review and approve pending membership applications
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {pendingMembers.length} pending application{pendingMembers.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Pending Approvals */}
        {pendingMembers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              All caught up!
            </h3>
            <p className="text-gray-500">
              There are no pending membership applications to review.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingMembers.map((member) => (
              <ApprovalCard key={member.id} member={member} />
            ))}
          </div>
        )}

        {/* Bulk Actions */}
        {pendingMembers.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Bulk Actions
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Process multiple applications at once (coming soon)
            </p>
            <div className="flex space-x-3">
              <button
                disabled
                className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md text-sm font-medium cursor-not-allowed"
              >
                Approve All as Basic
              </button>
              <button
                disabled
                className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md text-sm font-medium cursor-not-allowed"
              >
                Send Reminder Emails
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}