import { useState, useEffect } from 'react';
import apiClient from '../services/api-client';
import toast from 'react-hot-toast';

export default function AIExplanationModal({ alert, sensor, onClose }) {
  const [loading, setLoading] = useState(true);
  const [explanation, setExplanation] = useState(null);
  const [actions, setActions] = useState(null);
  const [showActions, setShowActions] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (alert && sensor) {
      fetchExplanation();
    }
  }, [alert, sensor]);

  const fetchExplanation = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/ai/explain-alert', {
        alert,
        sensor,
        recentData: [], // Could fetch recent time-series data here
      });

      setExplanation(response.data.explanation);
    } catch (err) {
      console.error('Error fetching AI explanation:', err);
      setError(err.response?.data?.message || 'Failed to get AI explanation');
      toast.error('Failed to get AI explanation');
    } finally {
      setLoading(false);
    }
  };

  const fetchActions = async () => {
    try {
      setShowActions(true);
      toast.loading('Getting suggested actions...');

      const response = await apiClient.post('/ai/suggest-actions', {
        alert,
        sensor,
      });

      toast.dismiss();
      setActions(response.data.actions);
      toast.success('Actions loaded!');
    } catch (err) {
      toast.dismiss();
      console.error('Error fetching AI actions:', err);
      toast.error('Failed to get suggested actions');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🤖</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">AI Analysis</h2>
                <p className="text-sm text-gray-600">{sensor?.name || 'Sensor'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Alert Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Alert Summary</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Severity:</span> <span className={`
                  px-2 py-1 rounded-full text-xs font-semibold uppercase
                  ${alert.severity === 'critical' ? 'bg-red-100 text-red-800' : ''}
                  ${alert.severity === 'high' ? 'bg-orange-100 text-orange-800' : ''}
                  ${alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${alert.severity === 'low' ? 'bg-blue-100 text-blue-800' : ''}
                `}>{alert.severity}</span></p>
                <p><span className="font-medium">Type:</span> {alert.type}</p>
                <p><span className="font-medium">Message:</span> {alert.message}</p>
                {sensor?.currentValue && (
                  <p><span className="font-medium">Current Value:</span> {sensor.currentValue} {sensor.units}</p>
                )}
              </div>
            </div>

            {/* AI Explanation */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🧠</span>
                <h3 className="text-lg font-semibold text-gray-900">What's Happening?</h3>
              </div>
              
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  {error}
                </div>
              )}

              {explanation && !loading && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-5 shadow-inner">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base">
                    {explanation}
                  </p>
                </div>
              )}
            </div>

            {/* Suggested Actions */}
            {!showActions && explanation && (
              <button
                onClick={fetchActions}
                className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg hover:from-amber-600 hover:to-yellow-600 transition-all font-semibold shadow-lg"
                style={{ position: 'relative', zIndex: 10 }}
              >
                💡 Get Recommended Actions
              </button>
            )}

            {showActions && actions && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">💡</span>
                  <h3 className="text-lg font-semibold text-gray-900">Recommended Actions</h3>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-lg p-5 shadow-inner">
                  <div className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base font-medium">
                    {actions}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Powered by GPT-4 • Oil & Gas Operations Expert
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

