import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { Layout, PageHeader, Card, LoadingState, EmptyState } from '../components';
import { Navigate } from 'react-router-dom';
import apiClient from '../services/api-client';
import CreateTenantModal from '../components/CreateTenantModal';
import toast from 'react-hot-toast';

export const TenantsPage = () => {
  const { userClaims, switchTenant, activeTenantId } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Only super-admins can access
  if (userClaims?.role !== 'super-admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const { data, isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const response = await apiClient.get('/tenants');
      return response.data;
    },
  });

  /**
   * Switch to a tenant (or exit back to super-admin view)
   * @param {Object} tenant - The tenant to switch to
   */
  const handleSwitchToTenant = (tenant) => {
    if (activeTenantId === tenant.id) {
      // Currently viewing this tenant, exit back to own tenant
      switchTenant(userClaims?.tenantId || null);
      toast.success('Switched back to super-admin view');
      // Invalidate queries to refresh with super-admin context
      queryClient.invalidateQueries();
    } else {
      // Switch to this tenant
      switchTenant(tenant.id);
      toast.success(`Switched to tenant "${tenant.name}"`);
      // Invalidate queries to refresh with new tenant context
      queryClient.invalidateQueries();
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Tenant Management"
        subtitle="Manage customer accounts and organizations"
      />

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-gray-600">
              {data?.total || 0} tenants
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            + Add Tenant
          </button>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : data?.tenants?.length === 0 ? (
          <EmptyState
            title="No tenants yet"
            message="Create your first tenant to get started"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.tenants?.map((tenant) => (
              <Card key={tenant.id}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{tenant.name}</h3>
                      <p className="text-sm text-gray-500">{tenant.id}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      tenant.status === 'active' ? 'bg-green-100 text-green-800' :
                      tenant.status === 'trial' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {tenant.status}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Users</p>
                        <p className="font-semibold text-gray-900">{tenant.stats?.users || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Sensors</p>
                        <p className="font-semibold text-gray-900">{tenant.stats?.sensors || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-xs text-gray-500">
                      <strong>Plan:</strong> {tenant.subscription?.tier || 'starter'}
                    </p>
                    <p className="text-xs text-gray-500">
                      <strong>Contact:</strong> {tenant.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      <strong>Created:</strong> {new Date(tenant.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        setSelectedTenant(tenant);
                        setShowDetailsModal(true);
                      }}
                      className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleSwitchToTenant(tenant)}
                      className={`flex-1 px-3 py-2 text-sm rounded transition-colors shadow-md ${
                        activeTenantId === tenant.id
                          ? 'bg-orange-600 text-white hover:bg-orange-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                      style={{ position: 'relative', zIndex: 10 }}
                    >
                      {activeTenantId === tenant.id ? 'Exit Tenant' : 'Switch To'}
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Tenant Modal */}
      <CreateTenantModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(newTenant) => {
          queryClient.invalidateQueries(['tenants']);
          toast.success(`Tenant "${newTenant.name}" created successfully!`);
        }}
      />

      {/* Tenant Details Modal */}
      {showDetailsModal && selectedTenant && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowDetailsModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">Tenant Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Header Info */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-600">
                      {selectedTenant.name?.[0]?.toUpperCase() || 'T'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedTenant.name}</h3>
                    <p className="text-sm text-gray-500">{selectedTenant.id}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded ${
                      selectedTenant.status === 'active' ? 'bg-green-100 text-green-800' :
                      selectedTenant.status === 'trial' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedTenant.status}
                    </span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{selectedTenant.stats?.users || 0}</p>
                    <p className="text-sm text-gray-500">Users</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{selectedTenant.stats?.sensors || 0}</p>
                    <p className="text-sm text-gray-500">Sensors</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{selectedTenant.stats?.alerts || 0}</p>
                    <p className="text-sm text-gray-500">Alerts</p>
                  </div>
                </div>

                {/* Details */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{selectedTenant.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{selectedTenant.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Address</p>
                      <p className="font-medium text-gray-900">{selectedTenant.address || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Industry</p>
                      <p className="font-medium text-gray-900">{selectedTenant.industry || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Subscription */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Subscription</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Plan</p>
                      <p className="font-medium text-gray-900 capitalize">{selectedTenant.subscription?.tier || 'starter'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Max Users</p>
                      <p className="font-medium text-gray-900">{selectedTenant.subscription?.maxUsers || 5}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Max Sensors</p>
                      <p className="font-medium text-gray-900">{selectedTenant.subscription?.maxSensors || 10}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">AI Queries/Day</p>
                      <p className="font-medium text-gray-900">{selectedTenant.subscription?.aiQueriesPerDay || 10}</p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Created</p>
                      <p className="font-medium text-gray-900">
                        {selectedTenant.createdAt ? new Date(selectedTenant.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Last Updated</p>
                      <p className="font-medium text-gray-900">
                        {selectedTenant.updatedAt ? new Date(selectedTenant.updatedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-200 pt-4 flex gap-3">
                  <button
                    onClick={() => {
                      handleSwitchToTenant(selectedTenant);
                      setShowDetailsModal(false);
                    }}
                    className={`flex-1 px-4 py-2 rounded font-medium transition-colors ${
                      activeTenantId === selectedTenant.id
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {activeTenantId === selectedTenant.id ? 'Exit Tenant View' : 'Switch to Tenant'}
                  </button>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded font-medium hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}    </Layout>
  );
};