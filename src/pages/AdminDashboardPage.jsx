import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { Layout, PageHeader, Card, LoadingState } from '../components';
import { Navigate } from 'react-router-dom';
import apiClient from '../services/api-client';

export const AdminDashboardPage = () => {
  const { userClaims } = useAuth();

  // Only super-admins can access
  if (userClaims?.role !== 'super-admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/dashboard');
      return response.data;
    },
  });

  return (
    <Layout>
      <PageHeader
        title="Super Admin Dashboard"
        subtitle="System overview and management"
      />

      <div className="p-4 sm:p-6 lg:p-8">
        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <Card>
                <div className="text-center">
                  <p className="text-gray-600 text-sm font-medium mb-2">Total Tenants</p>
                  <p className="text-4xl font-bold text-primary-600">{data?.stats.totalTenants || 0}</p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <p className="text-gray-600 text-sm font-medium mb-2">Total Users</p>
                  <p className="text-4xl font-bold text-primary-600">{data?.stats.totalUsers || 0}</p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <p className="text-gray-600 text-sm font-medium mb-2">Total Sensors</p>
                  <p className="text-4xl font-bold text-primary-600">{data?.stats.totalSensors || 0}</p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <p className="text-gray-600 text-sm font-medium mb-2">Total Alerts</p>
                  <p className="text-4xl font-bold text-gray-700">{data?.stats.totalAlerts || 0}</p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <p className="text-gray-600 text-sm font-medium mb-2">Active Alerts</p>
                  <p className="text-4xl font-bold text-red-600">{data?.stats.activeAlerts || 0}</p>
                </div>
              </Card>
            </div>

            {/* Top Tenants */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Tenants by Users</h3>
                <div className="space-y-3">
                  {data?.topTenants?.slice(0, 5).map((tenant) => (
                    <div
                      key={tenant.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{tenant.name}</p>
                        <p className="text-sm text-gray-500">{tenant.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary-600">{tenant.userCount} users</p>
                        <p className="text-xs text-gray-500 capitalize">{tenant.subscription?.tier || 'starter'}</p>
                      </div>
                    </div>
                  ))}
                  {(!data?.topTenants || data.topTenants.length === 0) && (
                    <p className="text-gray-500 text-center py-4">No tenants yet</p>
                  )}
                </div>
              </Card>

              {/* Recent Alerts */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent System Alerts</h3>
                <div className="space-y-3">
                  {data?.recentAlerts?.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {alert.tenantId} • {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                  ))}
                  {(!data?.recentAlerts || data.recentAlerts.length === 0) && (
                    <p className="text-gray-500 text-center py-4">No recent alerts</p>
                  )}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

