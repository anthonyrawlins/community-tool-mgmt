'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from "@/components/layout/MainLayout";
import { MemberLayout } from "@/components/member/MemberLayout";
import { MembershipStatusCard } from "@/components/member/MembershipStatusCard";
import { LoadingCard } from "@/components/member/LoadingCard";
import { useAuth } from "@/hooks/useAuth";
import { ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { UserProfile, ProfileUpdateForm } from "@/types";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, refresh: refreshAuth } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileUpdateForm>({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    suburb: '',
    postcode: '',
    state: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      setProfile(user);
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        address: user.address || '',
        suburb: user.suburb || '',
        postcode: user.postcode || '',
        state: user.state || '',
      });
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiClient.getUserProfile();
      setProfile(response.data.user);
      setFormData({
        firstName: response.data.user.firstName,
        lastName: response.data.user.lastName,
        phone: response.data.user.phone || '',
        address: response.data.user.address || '',
        suburb: response.data.user.suburb || '',
        postcode: response.data.user.postcode || '',
        state: response.data.user.state || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await ApiClient.updateUserProfile(formData);
      setProfile(response.data.user);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      
      // Refresh auth state to update the user data in the auth hook
      refreshAuth();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone || '',
        address: profile.address || '',
        suburb: profile.suburb || '',
        postcode: profile.postcode || '',
        state: profile.state || '',
      });
    }
    setIsEditing(false);
    setError(null);
  };

  if (authLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <LoadingCard />
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
              <p className="text-blue-600 mb-6">Please log in to view your profile.</p>
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

  if (error && !loading && !profile) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <MemberLayout>
            <div className="text-center py-16">
              <div className="bg-red-50 border border-red-200 rounded-lg p-12">
                <h3 className="text-2xl font-semibold mb-4 text-red-800">Error Loading Profile</h3>
                <p className="text-red-600 mb-6">{error}</p>
                <Button onClick={loadProfile} className="bg-red-600 hover:bg-red-700 text-white">
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
                <p className="text-gray-600">
                  Manage your personal information and account settings.
                </p>
              </div>
              {!isEditing && (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Edit Profile
                </Button>
              )}
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-green-800">{successMessage}</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-red-600">✗</span>
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="space-y-6">
                <LoadingCard />
                <LoadingCard />
              </div>
            )}

            {/* Profile Content */}
            {!loading && profile && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Profile Form */}
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
                    
                    {isEditing ? (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              First Name *
                            </label>
                            <input
                              type="text"
                              value={formData.firstName}
                              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Last Name *
                            </label>
                            <input
                              type="text"
                              value={formData.lastName}
                              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={profile.email}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">Email cannot be changed. Contact support if needed.</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address
                          </label>
                          <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="Street address"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Suburb
                            </label>
                            <input
                              type="text"
                              value={formData.suburb}
                              onChange={(e) => setFormData(prev => ({ ...prev, suburb: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Postcode
                            </label>
                            <input
                              type="text"
                              value={formData.postcode}
                              onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State
                          </label>
                          <select
                            value={formData.state}
                            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select a state</option>
                            <option value="NSW">New South Wales</option>
                            <option value="VIC">Victoria</option>
                            <option value="QLD">Queensland</option>
                            <option value="WA">Western Australia</option>
                            <option value="SA">South Australia</option>
                            <option value="TAS">Tasmania</option>
                            <option value="ACT">Australian Capital Territory</option>
                            <option value="NT">Northern Territory</option>
                          </select>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button
                            type="submit"
                            disabled={saving}
                            loading={saving}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Save Changes
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={saving}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <p className="mt-1 text-gray-900">{profile.firstName}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <p className="mt-1 text-gray-900">{profile.lastName}</p>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <p className="mt-1 text-gray-900">{profile.email}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Phone</label>
                          <p className="mt-1 text-gray-900">{profile.phone || 'Not provided'}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Address</label>
                          <div className="mt-1 text-gray-900">
                            {profile.address ? (
                              <>
                                <p>{profile.address}</p>
                                {(profile.suburb || profile.postcode || profile.state) && (
                                  <p>
                                    {[profile.suburb, profile.state, profile.postcode].filter(Boolean).join(', ')}
                                  </p>
                                )}
                              </>
                            ) : (
                              'Not provided'
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Account Role</label>
                          <p className="mt-1 text-gray-900 capitalize">{profile.role.toLowerCase()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Membership Info */}
                <div className="space-y-6">
                  {profile.member && (
                    <MembershipStatusCard
                      member={profile.member}
                      onRenew={() => {
                        console.log('Renew membership');
                        // Handle membership renewal
                      }}
                    />
                  )}

                  {/* Account Security */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Security</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <p className="mt-1 text-gray-600">••••••••</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            // Handle password change
                            console.log('Change password');
                          }}
                        >
                          Change Password
                        </Button>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                        <p className="mt-1 text-gray-600">Not enabled</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            // Handle 2FA setup
                            console.log('Setup 2FA');
                          }}
                        >
                          Enable 2FA
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Notification Preferences */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Email notifications for loan reminders</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">SMS notifications for overdue items</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Newsletter and updates</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </MemberLayout>
      </div>
    </MainLayout>
  );
}