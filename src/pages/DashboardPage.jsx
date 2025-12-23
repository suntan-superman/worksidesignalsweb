import { useState } from 'react';
import { useDashboardSummary, useAlerts, useAlertSummary } from '../hooks/queries';
import { useAuth } from '../context/AuthContext';
import { Layout, PageHeader, Card, LoadingState, EmptyState, SeverityBadge, ErrorState } from '../components';
import AIExplanationModal from '../components/AIExplanationModal';

export const DashboardPage = () => {
  const { currentUser } = useAuth();
  const tenantId = 'default-tenant'; // In production, get from currentUser
  
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);

  const { 
    data: dashboardData, 
    isLoading: dashboardLoading, 
    error: dashboardError,
    refetch: refetchDashboard 
  } = useDashboardSummary(tenantId);
  
  // Use alert summary for counts (more efficient than fetching all alerts)
  const {
    data: alertSummary,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useAlertSummary(tenantId);
  
  // Fetch recent alerts only (limited list for display)
  const { 
    data: recentAlerts, 
    isLoading: alertsLoading, 
    error: alertsError,
    refetch: refetchAlerts 
  } = useAlerts(tenantId, {
    searchTerm: '',
    status: 'active', // Only fetch active alerts for recent list
  });

  const isLoading = dashboardLoading || alertsLoading || summaryLoading;
  const hasError = dashboardError || alertsError || summaryError;

  const handleRetry = () => {
    if (dashboardError) refetchDashboard();
    if (alertsError) refetchAlerts();
    if (summaryError) refetchSummary();
  };

  const handleExplainAlert = (alert) => {
    const mockSensor = {
      name: alert.sensorName,
      type: alert.type || 'unknown',
      units: 'units',
      currentValue: null,
      normalRange: { min: 0, max: 100 },
    };
    
    setSelectedAlert({ alert, sensor: mockSensor });
    setShowAIModal(true);
  };

  return (
    <Layout>
      <PageHeader
        title="Dashboard"
        subtitle="Monitor your data quality and active alerts"
      />

      <div className="p-4 sm:p-6 lg:p-8">
        {isLoading ? (
          <LoadingState />
        ) : hasError ? (
          <ErrorState 
            title="Failed to load dashboard"
            message={dashboardError?.message || alertsError?.message || summaryError?.message || "Unable to fetch dashboard data. Please try again."}
            onRetry={handleRetry}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Data Health Score Card */}
            <Card>
              <div className="text-center">
                <p className="text-gray-600 text-sm font-medium mb-2">Data Health Score</p>
                <p className="text-4xl font-bold text-primary-600">{dashboardData?.healthScore}%</p>
                <p className="text-gray-500 text-xs mt-2">Overall quality</p>
              </div>
            </Card>

            {/* Critical Alerts Card - using summary endpoint */}
            <Card>
              <div className="text-center">
                <p className="text-gray-600 text-sm font-medium mb-2">Critical Alerts</p>
                <p className="text-4xl font-bold text-red-600">
                  {alertSummary?.bySeverity?.critical || dashboardData?.alertCounts?.critical || 0}
                </p>
                <p className="text-gray-500 text-xs mt-2">Require immediate attention</p>
              </div>
            </Card>

            {/* Active Sensors Card */}
            <Card>
              <div className="text-center">
                <p className="text-gray-600 text-sm font-medium mb-2">Active Sensors</p>
                <p className="text-4xl font-bold text-primary-600">{dashboardData?.activeSensors}</p>
                <p className="text-gray-500 text-xs mt-2">Currently monitoring</p>
              </div>
            </Card>

            {/* Acknowledged Alerts Card - using summary endpoint */}
            <Card>
              <div className="text-center">
                <p className="text-gray-600 text-sm font-medium mb-2">Acknowledged</p>
                <p className="text-4xl font-bold text-blue-600">
                  {alertSummary?.byStatus?.acknowledged || dashboardData?.acknowledgedAlerts || 0}
                </p>
                <p className="text-gray-500 text-xs mt-2">In progress</p>
              </div>
            </Card>
          </div>
        )}

        {/* Recent Alerts Section */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Alerts</h2>
          {recentAlerts && recentAlerts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Severity</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Sensor</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Message</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Time</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAlerts.slice(0, 5).map((alert) => (
                    <tr key={alert.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <SeverityBadge severity={alert.severity} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{alert.sensorName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{alert.message}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          alert.status === 'active'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {alert.status === 'active' ? 'Active' : 'Acknowledged'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(alert.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleExplainAlert(alert)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
                        >
                          🤖 Explain
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No alerts"
              message="Your data quality is looking good!"
              icon="✅"
            />
          )}
        </Card>
      </div>

      {/* AI Explanation Modal */}
      {showAIModal && selectedAlert && (
        <AIExplanationModal
          alert={selectedAlert.alert}
          sensor={selectedAlert.sensor}
          onClose={() => {
            setShowAIModal(false);
            setSelectedAlert(null);
          }}
        />
      )}
    </Layout>
  );
};

