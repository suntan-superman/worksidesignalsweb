import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSensors } from '../hooks/queries';
import { useAuth } from '../context/AuthContext';
import { Layout, PageHeader, Card, LoadingState, EmptyState, StatusBadge, SensorsGrid } from '../components';

export const SensorsPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const tenantId = 'default-tenant'; // In production, get from currentUser
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data: sensors, isLoading } = useSensors(tenantId);

  const filteredSensors = sensors?.filter(sensor => {
    const matchesSearch = sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sensor.wellName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || sensor.type === typeFilter;
    return matchesSearch && matchesType;
  }) || [];

  const sensorTypes = [...new Set(sensors?.map(s => s.type) || [])];

  return (
    <Layout>
      <PageHeader
        title="Sensors"
        subtitle="Manage and monitor your sensors"
      >
        <button className="btn-primary">
          + Add Sensor
        </button>
      </PageHeader>

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Sensors Grid */}
        <Card>
          <SensorsGrid
            sensors={sensors || []}
            isLoading={isLoading}
            onRowClick={(sensorId) => navigate(`/sensors/${sensorId}`)}
          />
          {sensors && sensors.length === 0 && !isLoading && (
            <EmptyState
              title="No sensors"
              message="Add your first sensor to get started"
              icon="📊"
            />
          )}
        </Card>
      </div>
    </Layout>
  );
};

