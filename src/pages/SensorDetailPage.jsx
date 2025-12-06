import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSensor, useTimeSeries, useAlerts, useAIDetectAnomalies } from '../hooks/queries';
import { Layout, PageHeader, Card, LoadingState, ErrorState, SeverityBadge, TimeSeriesChart } from '../components';

export const SensorDetailPage = () => {
  const { sensorId } = useParams();
  const navigate = useNavigate();
  const tenantId = 'default-tenant';
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const { data: sensor, isLoading: sensorLoading, error: sensorError } = useSensor(sensorId);
  const { data: timeSeries, isLoading: timeSeriesLoading } = useTimeSeries(sensorId);
  const { data: sensorAlerts } = useAlerts(tenantId, {});
  const detectAnomaliesMutation = useAIDetectAnomalies();

  if (sensorError) {
    return (
      <Layout>
        <PageHeader title="Sensor Not Found" />
        <div className="p-4 sm:p-6 lg:p-8">
          <ErrorState
            title="Sensor Not Found"
            message="The sensor you're looking for doesn't exist"
            onRetry={() => navigate('/sensors')}
          />
        </div>
      </Layout>
    );
  }

  if (sensorLoading) {
    return (
      <Layout>
        <PageHeader title="Loading..." />
        <div className="p-4 sm:p-6 lg:p-8">
          <LoadingState />
        </div>
      </Layout>
    );
  }

  const sensorAlertsForThisSensor = sensorAlerts?.filter(a => a.sensorId === sensorId) || [];

  const handleAIAnalysis = () => {
    if (timeSeries && timeSeries.length > 0) {
      detectAnomaliesMutation.mutate(
        { sensorId, timeSeriesData: timeSeries },
        {
          onSuccess: (data) => {
            setAiAnalysis(data);
          },
        }
      );
    }
  };

  return (
    <Layout>
      <PageHeader
        title={sensor?.name}
        subtitle={`${sensor?.wellName} / ${sensor?.padName}`}
      >
        <button
          onClick={() => navigate('/sensors')}
          className="btn-secondary"
        >
          ← Back to Sensors
        </button>
      </PageHeader>

      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Sensor Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Type */}
          <Card>
            <p className="text-gray-600 text-sm font-medium mb-1">Type</p>
            <p className="text-xl font-bold text-gray-900">
              {sensor?.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </p>
          </Card>

          {/* Units */}
          <Card>
            <p className="text-gray-600 text-sm font-medium mb-1">Units</p>
            <p className="text-xl font-bold text-gray-900">{sensor?.units}</p>
          </Card>

          {/* Current Value */}
          <Card>
            <p className="text-gray-600 text-sm font-medium mb-1">Current Value</p>
            <p className="text-xl font-bold text-primary-600">
              {sensor?.currentValue !== null ? `${sensor?.currentValue} ${sensor?.units}` : '—'}
            </p>
          </Card>

          {/* Status */}
          <Card>
            <p className="text-gray-600 text-sm font-medium mb-1">Status</p>
            <p className={`text-xl font-bold ${sensor?.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
              {sensor?.status === 'active' ? 'Active' : 'Inactive'}
            </p>
          </Card>
        </div>

        {/* Configuration */}
        <Card>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Normal Range</p>
              <p className="text-lg font-semibold text-gray-900">
                {sensor?.normalRange.min} - {sensor?.normalRange.max} {sensor?.units}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Last Update</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(sensor?.lastUpdate).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Rule Set</p>
              <p className="text-lg font-semibold text-gray-900">{sensor?.ruleSetId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Sensor ID</p>
              <p className="text-lg font-semibold text-gray-900 font-mono text-sm">{sensor?.id}</p>
            </div>
          </div>
        </Card>

        {/* Time Series Chart */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Last 24 Hours</h2>
            <button
              onClick={handleAIAnalysis}
              disabled={detectAnomaliesMutation.isPending || !timeSeries || timeSeries.length === 0}
              className="btn-primary text-sm flex items-center gap-2"
            >
              {detectAnomaliesMutation.isPending ? (
                <>
                  <span className="animate-spin">🤖</span>
                  Analyzing...
                </>
              ) : (
                <>
                  🤖 AI Analysis
                </>
              )}
            </button>
          </div>

          <TimeSeriesChart
            data={timeSeries}
            sensorName={sensor?.name}
            units={sensor?.units}
            isLoading={timeSeriesLoading}
          />

          {/* AI Analysis Results */}
          {aiAnalysis && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🤖</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-2">AI Analysis</h3>
                  <p className="text-sm text-blue-800 whitespace-pre-line">{aiAnalysis.analysis}</p>
                  {aiAnalysis.statistics && (
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div className="bg-white rounded px-2 py-1">
                        <span className="text-gray-600">Mean:</span>{' '}
                        <span className="font-semibold text-gray-900">{aiAnalysis.statistics.mean.toFixed(2)}</span>
                      </div>
                      <div className="bg-white rounded px-2 py-1">
                        <span className="text-gray-600">Min:</span>{' '}
                        <span className="font-semibold text-gray-900">{aiAnalysis.statistics.min.toFixed(2)}</span>
                      </div>
                      <div className="bg-white rounded px-2 py-1">
                        <span className="text-gray-600">Max:</span>{' '}
                        <span className="font-semibold text-gray-900">{aiAnalysis.statistics.max.toFixed(2)}</span>
                      </div>
                      <div className="bg-white rounded px-2 py-1">
                        <span className="text-gray-600">Std Dev:</span>{' '}
                        <span className="font-semibold text-gray-900">{aiAnalysis.statistics.stdDev.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Recent Alerts */}
        <Card>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Alerts</h2>
          {sensorAlertsForThisSensor.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Severity</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Type</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Message</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sensorAlertsForThisSensor.map((alert) => (
                    <tr key={alert.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <SeverityBadge severity={alert.severity} />
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                          {alert.type}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-600">{alert.message}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          alert.status === 'active'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {alert.status === 'active' ? 'Active' : 'Acknowledged'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-500">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No alerts for this sensor</p>
          )}
        </Card>
      </div>
    </Layout>
  );
};

