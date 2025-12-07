import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api-client';
import toast from 'react-hot-toast';

export default function DemoControlPage() {
  const navigate = useNavigate();
  const { currentUser, userClaims } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [tenantId, setTenantId] = useState(userClaims?.tenantId || '');

  // Check current demo status
  const checkStatus = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/demo/status?tenantId=${tenantId || userClaims?.tenantId}`);
      setStatus(response.data);
      toast.success('Status loaded!');
    } catch (error) {
      console.error('Error checking status:', error);
      toast.error('Failed to check status');
    } finally {
      setLoading(false);
    }
  };

  // Populate demo data
  const populateData = async () => {
    if (!window.confirm('This will generate 25 sensors and 7 days of data. Continue?')) {
      return;
    }

    try {
      setLoading(true);
      toast.loading('Generating demo data... This may take 30-60 seconds.');
      
      const response = await apiClient.post('/demo/populate', {
        tenantId: tenantId || userClaims?.tenantId,
        sensorCount: 25,
        daysOfHistory: 7,
      });

      toast.dismiss();
      toast.success(`Success! Created ${response.data.data.sensorsCreated} sensors and ${response.data.data.alertsCreated} alerts!`);
      
      // Refresh status
      await checkStatus();
    } catch (error) {
      toast.dismiss();
      console.error('Error populating data:', error);
      toast.error(error.response?.data?.message || 'Failed to populate data');
    } finally {
      setLoading(false);
    }
  };

  // Clear demo data
  const clearData = async () => {
    if (!window.confirm('⚠️ This will DELETE all sensors, alerts, and time-series data for this tenant. Are you sure?')) {
      return;
    }

    try {
      setLoading(true);
      toast.loading('Clearing demo data...');
      
      const response = await apiClient.delete('/demo/clear', {
        data: { tenantId: tenantId || userClaims?.tenantId },
      });

      toast.dismiss();
      toast.success(`Cleared ${response.data.data.sensorsDeleted} sensors and ${response.data.data.alertsDeleted} alerts!`);
      
      // Refresh status
      setStatus(null);
      await checkStatus();
    } catch (error) {
      toast.dismiss();
      console.error('Error clearing data:', error);
      toast.error(error.response?.data?.message || 'Failed to clear data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Demo Control Panel</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-lg"
            style={{ position: 'relative', zIndex: 10 }}
          >
            📊 View Dashboard
          </button>
        </div>
        <p className="text-gray-600 mb-8">
          Generate realistic demo data for sales calls and testing
        </p>

        {/* Tenant Selection (Super Admin Only) */}
        {userClaims?.role === 'super-admin' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Tenant ID
            </label>
            <input
              type="text"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              placeholder="Enter tenant ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank to use your current tenant ({userClaims?.tenantId})
            </p>
          </div>
        )}

        {/* Current Status */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Current Status</h2>
            <button
              onClick={checkStatus}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium shadow-md"
              style={{ position: 'relative', zIndex: 10 }}
            >
              🔄 Refresh Status
            </button>
          </div>

          {status ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Sensors</p>
                <p className="text-3xl font-bold text-primary-600">{status.sensors}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Alerts</p>
                <p className="text-3xl font-bold text-orange-600">{status.alerts}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Data Points</p>
                <p className="text-3xl font-bold text-blue-600">
                  {status.dataPoints?.toLocaleString()}
                </p>
              </div>
              
              {status.dateRange && (
                <div className="col-span-1 md:col-span-3 bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Time Range</p>
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">Start:</span> {new Date(status.dateRange.start).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">End:</span> {new Date(status.dateRange.end).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Click "Refresh Status" to check current data
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🎬 Generate Demo Data
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Creates 25 sensors across 5 wells with 7 days of realistic time-series data.
              Includes normal operations, some drift, occasional spikes, and 10-15 alerts.
            </p>
            <button
              onClick={populateData}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium shadow-lg"
              style={{ position: 'relative', zIndex: 10 }}
            >
              🎬 Generate Demo Data
            </button>
          </div>

          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🧹 Clear Demo Data
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              ⚠️ Permanently deletes all sensors, alerts, and time-series data for this tenant.
              Use this to reset demos or clean up test data.
            </p>
            <button
              onClick={clearData}
              disabled={loading || !status?.hasData}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium shadow-lg"
              style={{ position: 'relative', zIndex: 10 }}
            >
              🧹 Clear All Data
            </button>
          </div>
        </div>

        {/* Quick Navigation */}
        {status?.hasData && (
          <div className="mt-8 p-6 bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🚀 Explore Your Demo Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Demo data generated! Navigate to these pages to see your sensors, alerts, and AI features:
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-lg"
                style={{ position: 'relative', zIndex: 10 }}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => navigate('/alerts')}
                className="px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-lg"
                style={{ position: 'relative', zIndex: 10 }}
              >
                🚨 Alerts
              </button>
              <button
                onClick={() => navigate('/sensors')}
                className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-lg"
                style={{ position: 'relative', zIndex: 10 }}
              >
                📡 Sensors
              </button>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 Demo Tips</h3>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>Generate data takes 30-60 seconds depending on server load</li>
            <li>Data includes: pressure, temperature, flow, level, and vibration sensors</li>
            <li>Alerts are automatically created based on out-of-range values</li>
            <li>Perfect for showing realistic oil & gas monitoring scenarios</li>
            <li>Safe to run multiple times (will add more data)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

