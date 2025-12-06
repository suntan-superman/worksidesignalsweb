import { useState } from 'react';
import { useSensors, useUpdateSensor, useCreateSensor } from '../hooks/queries';
import { useAuth } from '../context/AuthContext';
import { Layout, PageHeader, Card, LoadingState, EmptyState } from '../components';

export const SettingsPage = () => {
  const { currentUser } = useAuth();
  const tenantId = 'default-tenant';

  const [selectedSensorId, setSelectedSensorId] = useState(null);
  const [formMode, setFormMode] = useState('view'); // 'view', 'edit', 'create'
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    units: '',
    wellName: '',
    padName: '',
    normalRangeMin: '',
    normalRangeMax: '',
  });
  const [successMessage, setSuccessMessage] = useState('');

  const { data: sensors, isLoading } = useSensors(tenantId);
  const updateSensorMutation = useUpdateSensor();
  const createSensorMutation = useCreateSensor();

  const selectedSensor = sensors?.find(s => s.id === selectedSensorId);

  const handleSelectSensor = (sensorId) => {
    const sensor = sensors?.find(s => s.id === sensorId);
    if (sensor) {
      setSelectedSensorId(sensorId);
      setFormData({
        name: sensor.name,
        type: sensor.type,
        units: sensor.units,
        wellName: sensor.wellName,
        padName: sensor.padName,
        normalRangeMin: sensor.normalRange.min,
        normalRangeMax: sensor.normalRange.max,
      });
      setFormMode('view');
    }
  };

  const handleStartEdit = () => {
    setFormMode('edit');
  };

  const handleCancel = () => {
    setFormMode('view');
    setSelectedSensorId(null);
    setSuccessMessage('');
  };

  const handleSave = async () => {
    if (formMode === 'edit' && selectedSensorId) {
      updateSensorMutation.mutate(
        {
          sensorId: selectedSensorId,
          updates: {
            name: formData.name,
            type: formData.type,
            units: formData.units,
            wellName: formData.wellName,
            padName: formData.padName,
            normalRange: {
              min: parseFloat(formData.normalRangeMin),
              max: parseFloat(formData.normalRangeMax),
            },
          },
        },
        {
          onSuccess: () => {
            setSuccessMessage('Sensor configuration updated successfully!');
            setFormMode('view');
            setTimeout(() => setSuccessMessage(''), 3000);
          },
        }
      );
    } else if (formMode === 'create') {
      createSensorMutation.mutate(
        {
          name: formData.name,
          type: formData.type,
          units: formData.units,
          wellName: formData.wellName,
          padName: formData.padName,
          normalRange: {
            min: parseFloat(formData.normalRangeMin),
            max: parseFloat(formData.normalRangeMax),
          },
          status: 'active',
          currentValue: 0,
          lastUpdate: new Date().toISOString(),
        },
        {
          onSuccess: () => {
            setSuccessMessage('Sensor created successfully!');
            setFormMode('view');
            setFormData({
              name: '',
              type: '',
              units: '',
              wellName: '',
              padName: '',
              normalRangeMin: '',
              normalRangeMax: '',
            });
            setTimeout(() => setSuccessMessage(''), 3000);
          },
        }
      );
    }
  };

  const handleNewSensor = () => {
    setFormMode('create');
    setSelectedSensorId(null);
    setFormData({
      name: '',
      type: '',
      units: '',
      wellName: '',
      padName: '',
      normalRangeMin: '',
      normalRangeMax: '',
    });
  };

  const sensorTypes = ['temperature', 'pressure', 'flow-rate', 'vibration'];

  const isFormValid =
    formData.name &&
    formData.type &&
    formData.units &&
    formData.wellName &&
    formData.padName &&
    formData.normalRangeMin &&
    formData.normalRangeMax;

  return (
    <Layout>
      <PageHeader
        title="Settings"
        subtitle="Manage sensors and system configuration"
      >
        <button
          onClick={handleNewSensor}
          className="btn-primary"
        >
          + New Sensor
        </button>
      </PageHeader>

      <div className="p-4 sm:p-6 lg:p-8">
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            ✓ {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sensor List */}
          <div className="lg:col-span-1">
            <Card>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Sensors</h2>
              {isLoading ? (
                <LoadingState />
              ) : sensors && sensors.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {sensors.map((sensor) => (
                    <button
                      key={sensor.id}
                      onClick={() => handleSelectSensor(sensor.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedSensorId === sensor.id
                          ? 'bg-primary-100 text-primary-700 border border-primary-300'
                          : 'hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm font-semibold">{sensor.name}</p>
                      <p className="text-xs text-gray-600">{sensor.type}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No sensors"
                  message="Create your first sensor"
                  icon="📊"
                />
              )}
            </Card>
          </div>

          {/* Sensor Configuration Form */}
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {formMode === 'create' ? 'Create New Sensor' : selectedSensor?.name || 'Select a Sensor'}
              </h2>

              {formMode === 'view' && !selectedSensorId ? (
                <EmptyState
                  title="No sensor selected"
                  message="Click a sensor to view or edit its configuration"
                  icon="⚙️"
                />
              ) : (
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sensor Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sensor Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={formMode === 'view'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                        placeholder="e.g., Temperature Sensor - Well A1"
                      />
                    </div>

                    {/* Sensor Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        disabled={formMode === 'view'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                      >
                        <option value="">Select type</option>
                        {sensorTypes.map(type => (
                          <option key={type} value={type}>
                            {type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Units */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Units
                      </label>
                      <input
                        type="text"
                        value={formData.units}
                        onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                        disabled={formMode === 'view'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                        placeholder="e.g., °C"
                      />
                    </div>

                    {/* Well Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Well Name
                      </label>
                      <input
                        type="text"
                        value={formData.wellName}
                        onChange={(e) => setFormData({ ...formData, wellName: e.target.value })}
                        disabled={formMode === 'view'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                        placeholder="e.g., Well A1"
                      />
                    </div>

                    {/* Pad Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pad Name
                      </label>
                      <input
                        type="text"
                        value={formData.padName}
                        onChange={(e) => setFormData({ ...formData, padName: e.target.value })}
                        disabled={formMode === 'view'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                        placeholder="e.g., Pad A"
                      />
                    </div>
                  </div>

                  {/* Normal Range */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Normal Range
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Min
                        </label>
                        <input
                          type="number"
                          value={formData.normalRangeMin}
                          onChange={(e) => setFormData({ ...formData, normalRangeMin: e.target.value })}
                          disabled={formMode === 'view'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Max
                        </label>
                        <input
                          type="number"
                          value={formData.normalRangeMax}
                          onChange={(e) => setFormData({ ...formData, normalRangeMax: e.target.value })}
                          disabled={formMode === 'view'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                          placeholder="100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 pt-4">
                    {formMode === 'view' && (
                      <>
                        <button
                          type="button"
                          onClick={handleStartEdit}
                          className="btn-primary"
                        >
                          ✎ Edit
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="btn-secondary"
                        >
                          Close
                        </button>
                      </>
                    )}
                    {(formMode === 'edit' || formMode === 'create') && (
                      <>
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={!isFormValid || updateSensorMutation.isPending || createSensorMutation.isPending}
                          className="btn-primary"
                        >
                          {updateSensorMutation.isPending || createSensorMutation.isPending ? 'Saving...' : '✓ Save'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </form>
              )}
            </Card>
          </div>
        </div>

        {/* Quick Settings */}
        <div className="mt-6">
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4">System Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Frequency
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option>Real-time</option>
                  <option>Hourly digest</option>
                  <option>Daily digest</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Channel
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option>Email</option>
                  <option>In-app only</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

