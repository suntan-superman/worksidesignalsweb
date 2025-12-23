import { useState } from 'react';
import { useAlerts, useUpdateAlertStatus, useDeleteAlert } from '../hooks/queries';
import { useAuth } from '../context/AuthContext';
import { Layout, PageHeader, Card, LoadingState, EmptyState, SeverityBadge, AlertsGrid } from '../components';
import AIExplanationModal from '../components/AIExplanationModal';

export const AlertsPage = () => {
  const { currentUser } = useAuth();
  const tenantId = 'default-tenant'; // In production, get from currentUser
  
  const [filters, setFilters] = useState({
    severity: null,
    status: null,
    searchTerm: '',
  });

  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);

  const { data: alerts, isLoading } = useAlerts(tenantId, filters);
  const updateAlertMutation = useUpdateAlertStatus();
  const deleteAlertMutation = useDeleteAlert();

  const handleAcknowledge = (alertId) => {
    updateAlertMutation.mutate({
      alertId,
      status: 'acknowledged',
    });
  };

  const handleDeleteAlert = (alertId) => {
    deleteAlertMutation.mutate(alertId);
  };

  const handleExplainAlert = (alert) => {
    // Create a mock sensor object from the alert data
    const mockSensor = {
      name: alert.sensorName,
      type: alert.type,
      units: 'units', // Could fetch from actual sensor
      currentValue: null, // Could fetch from actual sensor
      normalRange: { min: 0, max: 100 }, // Could fetch from actual sensor
    };
    
    setSelectedAlert({ alert, sensor: mockSensor });
    setShowAIModal(true);
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
            onExplainAlert={handleExplainAlert}
            onDelete={handleDeleteAlert}
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

