import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSensors, useDeleteSensor, useUpdateSensor } from '../hooks/queries';
import { useAuth } from '../context/AuthContext';
import { Layout, PageHeader, Card, LoadingState, EmptyState, StatusBadge, SensorsGrid } from '../components';
import toast from 'react-hot-toast';

export const SensorsPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const tenantId = 'default-tenant'; // In production, get from currentUser
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [editingSensor, setEditingSensor] = useState(null);

  const { data: sensors, isLoading } = useSensors(tenantId);
  const deleteSensorMutation = useDeleteSensor();
  const updateSensorMutation = useUpdateSensor();

  const handleDeleteSensor = (sensorId) => {
    deleteSensorMutation.mutate(sensorId, {
      onSuccess: () => toast.success('Sensor deleted'),
      onError: () => toast.error('Failed to delete sensor'),
    });
  };

  const handleEditSensor = (sensor) => {
    setEditingSensor(sensor);
  };

  const handleSaveSensor = (updates) => {
    updateSensorMutation.mutate(
      { sensorId: editingSensor.id, updates },
      {
        onSuccess: () => {
          toast.success('Sensor updated');
          setEditingSensor(null);
        },
        onError: () => toast.error('Failed to update sensor'),
      }
    );
  };

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
            onEdit={handleEditSensor}
            onDelete={handleDeleteSensor}
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

      {/* Edit Sensor Modal */}
      {editingSensor && (
        <EditSensorModal
          sensor={editingSensor}
          onClose={() => setEditingSensor(null)}
          onSave={handleSaveSensor}
          isSaving={updateSensorMutation.isPending}
        />
      )}
    </Layout>
  );
};

// Edit Sensor Modal Component
function EditSensorModal({ sensor, onClose, onSave, isSaving }) {
  const [formData, setFormData] = useState({
    name: sensor.name || '',
    type: sensor.type || '',
    units: sensor.units || '',
    wellName: sensor.wellName || '',
    padName: sensor.padName || '',
    status: sensor.status || 'active',
    normalRange: {
      min: sensor.normalRange?.min || 0,
      max: sensor.normalRange?.max || 100,
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Sensor</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="temperature">Temperature</option>
                <option value="pressure">Pressure</option>
                <option value="flow-rate">Flow Rate</option>
                <option value="vibration">Vibration</option>
                <option value="level">Level</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
              <input
                type="text"
                value={formData.units}
                onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., °F, PSI, GPM"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Well Name</label>
              <input
                type="text"
                value={formData.wellName}
                onChange={(e) => setFormData({ ...formData, wellName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pad Name</label>
              <input
                type="text"
                value={formData.padName}
                onChange={(e) => setFormData({ ...formData, padName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Normal Range</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min</label>
                <input
                  type="number"
                  value={formData.normalRange.min}
                  onChange={(e) => setFormData({
                    ...formData,
                    normalRange: { ...formData.normalRange, min: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max</label>
                <input
                  type="number"
                  value={formData.normalRange.max}
                  onChange={(e) => setFormData({
                    ...formData,
                    normalRange: { ...formData.normalRange, max: parseFloat(e.target.value) || 100 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

