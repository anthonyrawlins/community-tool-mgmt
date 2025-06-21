'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { FormField } from '@/components/admin/FormField';
import { ApiClient } from '@/lib/api';
import { AdminLoan, LoanCheckinForm, Tool, AdminUser } from '@/types';

export default function LoanProcessPage() {
  const [activeLoans, setActiveLoans] = useState<AdminLoan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<AdminLoan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [checkinForm, setCheckinForm] = useState<LoanCheckinForm>({
    loanId: '',
    conditionIn: 'GOOD',
    notes: '',
    damageFees: 0,
    lateFees: 0
  });

  useEffect(() => {
    loadActiveLoans();
  }, []);

  const loadActiveLoans = async () => {
    try {
      setLoading(true);
      const response = await ApiClient.getAdminLoans(
        { status: 'ACTIVE' }, 
        undefined, 
        1, 
        100
      );
      setActiveLoans(response.data.loans);
    } catch (error) {
      console.error('Failed to load active loans:', error);
      setError(error instanceof Error ? error.message : 'Failed to load active loans');
    } finally {
      setLoading(false);
    }
  };

  const handleLoanSelect = (loan: AdminLoan) => {
    setSelectedLoan(loan);
    setCheckinForm({
      loanId: loan.id,
      conditionIn: 'GOOD',
      notes: '',
      damageFees: 0,
      lateFees: calculateLateFees(loan)
    });
  };

  const calculateLateFees = (loan: AdminLoan) => {
    const now = new Date();
    const dueDate = new Date(loan.dueDate);
    const daysOverdue = Math.max(0, Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // $5 per day late fee (this should come from system settings)
    return daysOverdue * 5;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setCheckinForm(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value
    }));
  };

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;

    setProcessing(true);
    setError(null);

    try {
      await ApiClient.checkinLoan(checkinForm);
      setSuccess(`Successfully checked in ${selectedLoan.tool.name}`);
      setSelectedLoan(null);
      setCheckinForm({
        loanId: '',
        conditionIn: 'GOOD',
        notes: '',
        damageFees: 0,
        lateFees: 0
      });
      await loadActiveLoans();
    } catch (error) {
      console.error('Failed to check in loan:', error);
      setError(error instanceof Error ? error.message : 'Failed to check in loan');
    } finally {
      setProcessing(false);
    }
  };

  const filteredLoans = activeLoans.filter(loan => 
    loan.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.tool.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const overdueLoans = filteredLoans.filter(loan => {
    const now = new Date();
    const dueDate = new Date(loan.dueDate);
    return dueDate < now;
  });

  return (
    <AdminLayout title="Process Returns">
      <div className="max-w-6xl mx-auto space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-800">{success}</p>
            <button
              onClick={() => setSuccess(null)}
              className="ml-2 text-green-600 hover:text-green-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Loan Selection */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Active Loans</h2>
              <p className="text-sm text-gray-500 mt-1">Select a loan to process return</p>
            </div>

            <div className="p-4">
              <input
                type="text"
                placeholder="Search by member name, email, tool, or loan ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading loans...</p>
                </div>
              ) : filteredLoans.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  {searchTerm ? 'No loans match your search' : 'No active loans found'}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {overdueLoans.length > 0 && (
                    <div className="p-4 bg-red-50">
                      <h3 className="text-sm font-medium text-red-900 mb-2">
                        Overdue Items ({overdueLoans.length})
                      </h3>
                    </div>
                  )}
                  
                  {filteredLoans.map((loan) => {
                    const isOverdue = overdueLoans.includes(loan);
                    const daysOverdue = isOverdue ? Math.ceil((new Date().getTime() - new Date(loan.dueDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
                    
                    return (
                      <div
                        key={loan.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${
                          selectedLoan?.id === loan.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        } ${isOverdue ? 'bg-red-50' : ''}`}
                        onClick={() => handleLoanSelect(loan)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {loan.user.firstName} {loan.user.lastName}
                            </h4>
                            <p className="text-sm text-gray-500">{loan.user.email}</p>
                            <p className="font-medium text-gray-900 mt-1">{loan.tool.name}</p>
                            {loan.tool.brand && loan.tool.model && (
                              <p className="text-sm text-gray-500">{loan.tool.brand} {loan.tool.model}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Due:</p>
                            <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                              {new Date(loan.dueDate).toLocaleDateString()}
                            </p>
                            {isOverdue && (
                              <p className="text-xs text-red-500">
                                {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Check-in Form */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Process Return</h2>
              <p className="text-sm text-gray-500 mt-1">Complete the tool return process</p>
            </div>

            {selectedLoan ? (
              <form onSubmit={handleCheckin} className="p-6 space-y-4">
                {/* Loan Summary */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium text-gray-900 mb-2">Return Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Member:</span>
                      <p className="font-medium">{selectedLoan.user.firstName} {selectedLoan.user.lastName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Tool:</span>
                      <p className="font-medium">{selectedLoan.tool.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Loaned:</span>
                      <p>{new Date(selectedLoan.loanedAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Due:</span>
                      <p>{new Date(selectedLoan.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <FormField
                  label="Condition on Return"
                  type="select"
                  name="conditionIn"
                  value={checkinForm.conditionIn}
                  onChange={handleInputChange}
                  options={[
                    { label: 'Excellent', value: 'EXCELLENT' },
                    { label: 'Good', value: 'GOOD' },
                    { label: 'Fair', value: 'FAIR' },
                    { label: 'Needs Repair', value: 'NEEDS_REPAIR' }
                  ]}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Late Fees"
                    type="number"
                    name="lateFees"
                    value={checkinForm.lateFees}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    helpText="Automatically calculated"
                  />

                  <FormField
                    label="Damage Fees"
                    type="number"
                    name="damageFees"
                    value={checkinForm.damageFees}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    helpText="Additional damage fees"
                  />
                </div>

                <FormField
                  label="Notes"
                  type="textarea"
                  name="notes"
                  value={checkinForm.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Any notes about the return condition, damage, or member interaction..."
                />

                {(checkinForm.lateFees > 0 || checkinForm.damageFees > 0) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <h4 className="font-medium text-yellow-900">Total Fees: ${(checkinForm.lateFees + checkinForm.damageFees).toFixed(2)}</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      These fees will be added to the member's account and must be paid before future loans.
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedLoan(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  >
                    {processing ? 'Processing...' : 'Complete Return'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 text-center text-gray-500">
                Select a loan from the list to process its return
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}