import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api-client';

/**
 * Audit Logs Page - View system audit trail
 * Only accessible to super-admins and tenant-admins
 */
export default function AuditLogsPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    action: '',
    resource: '',
    userId: '',
    limit: 100,
  });

  // Fetch audit logs
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['auditLogs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.action) params.append('action', filters.action);
      if (filters.resource) params.append('resource', filters.resource);
      if (filters.userId) params.append('userId', filters.userId);
      params.append('limit', filters.limit.toString());
      
      const response = await apiClient.get(`/audit?${params}`);
      return response.data;
    },
    staleTime: 30000, // 30 seconds
  });

  // Fetch summary stats (super-admin only)
  const { data: summary } = useQuery({
    queryKey: ['auditSummary'],
    queryFn: async () => {
      const response = await apiClient.get('/audit/summary?days=7');
      return response.data;
    },
    enabled: user?.role === 'super-admin',
    staleTime: 60000, // 1 minute
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE': return 'success';
      case 'UPDATE': return 'warning';
      case 'DELETE': return 'error';
      case 'LOGIN': return 'info';
      case 'LOGOUT': return 'neutral';
      case 'EXPORT': return 'info';
      case 'ADMIN_ACTION': return 'warning';
      default: return 'neutral';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (isLoading) return <LoadingState message="Loading audit logs..." />;
  if (error) return <ErrorState message="Failed to load audit logs" onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="View system activity and compliance audit trail"
      />

      {/* Summary Cards (Super-admin only) */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{summary.totalEvents}</div>
              <div className="text-sm text-gray-500">Events (Last 7 Days)</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {summary.actionBreakdown?.CREATE || 0}
              </div>
              <div className="text-sm text-gray-500">Creates</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {summary.actionBreakdown?.UPDATE || 0}
              </div>
              <div className="text-sm text-gray-500">Updates</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {summary.actionBreakdown?.DELETE || 0}
              </div>
              <div className="text-sm text-gray-500">Deletes</div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="EXPORT">Export</option>
              <option value="ADMIN_ACTION">Admin Action</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
            <select
              value={filters.resource}
              onChange={(e) => handleFilterChange('resource', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Resources</option>
              <option value="user">Users</option>
              <option value="tenant">Tenants</option>
              <option value="sensor">Sensors</option>
              <option value="alert">Alerts</option>
              <option value="notification">Notifications</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Limit</label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={500}>500</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </Card>

      {/* Audit Log Table */}
      <Card>
        {!data?.logs?.length ? (
          <EmptyState
            title="No audit logs found"
            description="No events match your current filters"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={getActionColor(log.action)}>
                        {log.action}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {log.resource}
                      {log.resourceId && (
                        <span className="text-gray-400 ml-1">#{log.resourceId.slice(0, 8)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {log.userEmail || log.userId?.slice(0, 8) || 'System'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                      {log.details?.path || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {data?.logs?.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Showing {data.logs.length} of {data.total} events
          </div>
        )}
      </Card>
    </div>
  );
}
