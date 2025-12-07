import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { Layout, PageHeader, Card, LoadingState, EmptyState } from '../components';
import { Navigate } from 'react-router-dom';
import apiClient from '../services/api-client';
import CreateTenantModal from '../components/CreateTenantModal';
import toast from 'react-hot-toast';

export const TenantsPage = () => {
  const { userClaims } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);

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
                      onClick={() => {/* TODO: View tenant details */}}
                      className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => {/* TODO: Switch to tenant */}}
                      className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors shadow-md"
                      style={{ position: 'relative', zIndex: 10 }}
                    >
                      Switch To
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
    </Layout>
  );
};

