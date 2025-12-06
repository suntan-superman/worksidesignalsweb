import { useState } from 'react';
import { useAlerts, useUpdateAlertStatus } from '../hooks/queries';
import { useAuth } from '../context/AuthContext';
import { Layout, PageHeader, Card, LoadingState, EmptyState, SeverityBadge, AlertsGrid } from '../components';

export const AlertsPage = () => {
  const { currentUser } = useAuth();
  const tenantId = 'default-tenant'; // In production, get from currentUser
  
  const [filters, setFilters] = useState({
    severity: null,
    status: null,
    searchTerm: '',
  });

  const { data: alerts, isLoading } = useAlerts(tenantId, filters);
  const updateAlertMutation = useUpdateAlertStatus();

  const handleAcknowledge = (alertId) => {
    updateAlertMutation.mutate({
      alertId,
      status: 'acknowledged',
    });
  };

  const handleRowClick = (alertId) => {
    // Could navigate to detail view in future
    console.log('Alert clicked:', alertId);
  };

  return (
    <Layout>
      <PageHeader
        title="Alerts"
        subtitle="View and manage all sensor alerts"
      />

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Alerts Grid */}
        <Card>
          <AlertsGrid
            alerts={alerts || []}
            isLoading={isLoading}
            onAcknowledge={handleAcknowledge}
          />
          {alerts && alerts.length === 0 && !isLoading && (
            <EmptyState
              title="No alerts"
              message="Start monitoring sensors to receive alerts"
              icon="🔔"
            />
          )}
        </Card>
      </div>
    </Layout>
  );
};

