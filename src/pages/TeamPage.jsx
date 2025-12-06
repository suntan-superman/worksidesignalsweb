import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { Layout, PageHeader, Card, LoadingState, EmptyState } from '../components';
import apiClient from '../services/api-client';

export const TeamPage = () => {
  const { userClaims } = useAuth();
  const queryClient = useQueryClient();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [resetLinkModal, setResetLinkModal] = useState(null);

  // Only admins can access
  const isAdmin = ['super-admin', 'tenant-admin'].includes(userClaims?.role);

  if (!isAdmin) {
    return (
      <Layout>
        <PageHeader title="Access Denied" />
        <div className="p-6">
          <Card>
            <p>You don't have permission to access team management.</p>
          </Card>
        </div>
      </Layout>
    );
  }

  // Fetch users for current tenant
  const { data, isLoading, error } = useQuery({
    queryKey: ['users', userClaims?.tenantId],
    queryFn: async () => {
      const response = await apiClient.get(`/users?tenantId=${userClaims?.tenantId}`);
      return response.data;
    },
    enabled: !!userClaims?.tenantId,
  });

  // Resend invitation
  const resendInviteMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await apiClient.post(`/users/${userId}/reset-password`);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        alert('✅ Invitation email sent successfully!');
      } else if (data.resetLink) {
        // Email failed - show reset link modal
        setResetLinkModal({
          email: data.email || 'the user',
          link: data.resetLink,
          message: data.message,
        });
      } else {
        alert('Failed to send invitation');
      }
    },
    onError: (error) => {
      alert(`Failed to resend invitation: ${error.response?.data?.message || error.message}`);
    },
  });

  const getRoleBadge = (role) => {
    const styles = {
      'super-admin': 'bg-red-100 text-red-800',
      'tenant-admin': 'bg-purple-100 text-purple-800',
      'tenant-user': 'bg-blue-100 text-blue-800',
      'tenant-readonly': 'bg-gray-100 text-gray-800',
    };
    
    const labels = {
      'super-admin': 'Super Admin',
      'tenant-admin': 'Admin',
      'tenant-user': 'User',
      'tenant-readonly': 'Read-only',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded ${styles[role] || styles['tenant-user']}`}>
        {labels[role] || role}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      'active': 'bg-green-100 text-green-800',
      'invited': 'bg-yellow-100 text-yellow-800',
      'disabled': 'bg-gray-100 text-gray-600',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded ${styles[status] || styles['active']}`}>
        {status || 'active'}
      </span>
    );
  };

  return (
    <Layout>
      <PageHeader
        title="Team Management"
        subtitle="Manage users and permissions for your organization"
      />

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-gray-600">
              {data?.total || 0} team {data?.total === 1 ? 'member' : 'members'}
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Invite User
          </button>
        </div>

        {/* Users Table */}
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-red-600">Error loading team members</p>
              <p className="text-sm text-gray-500 mt-2">{error.message}</p>
            </div>
          </Card>
        ) : data?.users?.length === 0 ? (
          <EmptyState
            title="No team members yet"
            message="Invite your first team member to get started"
          />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.users?.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-700 font-semibold text-sm">
                              {user.displayName?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-3">
                          {user.status === 'invited' ? (
                            <button
                              onClick={() => resendInviteMutation.mutate(user.id)}
                              disabled={resendInviteMutation.isPending}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors font-medium shadow-sm"
                            >
                              {resendInviteMutation.isPending ? 'Sending...' : '📧 Resend Invite'}
                            </button>
                          ) : (
                            <button
                              onClick={() => {/* TODO: Edit user */}}
                              className="text-primary-600 hover:text-primary-800 font-semibold"
                            >
                              ✏️ Edit
                            </button>
                          )}
                          <button
                            onClick={() => resendInviteMutation.mutate(user.id)}
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            🔑 Reset PW
                          </button>
                          {user.status !== 'disabled' && (
                            <button
                              onClick={() => {/* TODO: Disable user */}}
                              className="text-red-600 hover:text-red-800 font-semibold"
                            >
                              🚫 Disable
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Invite User Modal */}
      {showInviteModal && (
        <InviteUserModal
          onClose={() => setShowInviteModal(false)}
          tenantId={userClaims?.tenantId}
          isSuperAdmin={userClaims?.role === 'super-admin'}
          setResetLinkModal={setResetLinkModal}
        />
      )}

      {/* Reset Link Modal (when email service not configured) */}
      {resetLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📧 Email Service Not Configured</h3>
            <p className="text-sm text-gray-600 mb-4">
              {resetLinkModal.message}
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-yellow-900 mb-2">📋 Copy & Share This Password Reset Link:</p>
              <div className="bg-white p-3 rounded border border-yellow-300">
                <code className="text-xs text-gray-800 break-all block">{resetLinkModal.link}</code>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(resetLinkModal.link);
                  alert('✅ Link copied to clipboard!');
                }}
                className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm font-medium shadow-sm"
              >
                📋 Copy Link to Clipboard
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-800">
                <strong>💡 How to use:</strong> Send this link to the user via Slack, email, SMS, or any messaging app. 
                They'll use it to set their password and activate their account. <strong>Link expires in 24 hours.</strong>
              </p>
            </div>

            <button
              onClick={() => setResetLinkModal(null)}
              className="btn-primary w-full"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

// Invite User Modal Component
function InviteUserModal({ onClose, tenantId, isSuperAdmin, setResetLinkModal }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    role: 'tenant-user',
    skipEmail: false,
  });
  const [tempPassword, setTempPassword] = useState(null);

  const inviteMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post('/users', {
        ...data,
        tenantId,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['users', tenantId]);
      
      if (data.temporaryPassword) {
        // Show temp password modal
        setTempPassword(data.temporaryPassword);
      } else if (data.resetLink) {
        // Email failed - show reset link
        setResetLinkModal({
          email: data.email || formData.email,
          link: data.resetLink,
          message: data.message || 'Email not configured',
        });
        onClose();
      } else {
        // Success - email sent
        alert('✅ Invitation sent successfully!');
        onClose();
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    inviteMutation.mutate(formData);
  };

  if (tempPassword) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Created!</h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800 mb-2">⚠️ <strong>Save this password - it won't be shown again!</strong></p>
            <div className="bg-white p-3 rounded border border-yellow-300 font-mono text-sm break-all">
              {tempPassword}
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Share these credentials with <strong>{formData.email}</strong> securely. They should change the password after first login.
          </p>
          <button
            onClick={() => {
              setTempPassword(null);
              onClose();
            }}
            className="btn-primary w-full"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Team Member</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="user@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="tenant-user">User - Can view and manage alerts</option>
              <option value="tenant-readonly">Read-only - View access only</option>
              <option value="tenant-admin">Admin - Full access to tenant</option>
              {isSuperAdmin && <option value="super-admin">Super Admin - System-wide access</option>}
            </select>
          </div>

          {isSuperAdmin && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="skipEmail"
                checked={formData.skipEmail}
                onChange={(e) => setFormData({ ...formData, skipEmail: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="skipEmail" className="ml-2 block text-sm text-gray-700">
                Skip email, generate temporary password (Super Admin only)
              </label>
            </div>
          )}

          {inviteMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                {inviteMutation.error?.response?.data?.message || 'Failed to invite user'}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={inviteMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={inviteMutation.isPending}
            >
              {inviteMutation.isPending ? 'Sending...' : formData.skipEmail ? 'Create User' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

