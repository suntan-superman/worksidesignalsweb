import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardAPI, alertsAPI, sensorsAPI, aiAPI } from '../services/api-client';
import {
  mockDashboardData,
  mockAlerts,
  mockSensors,
  mockTimeSeriesData,
} from '../services/mock-data';

/**
 * @fileoverview React Query hooks for data fetching and mutations.
 * Provides centralized data fetching with automatic caching, background
 * refetching, and optimistic updates for the Workside Signals application.
 */

/** Toggle between API and mock data based on environment variable */
const USE_BACKEND_API = import.meta.env.VITE_USE_BACKEND_API === 'true';

// ==================== Dashboard Queries ====================

/**
 * Fetches dashboard summary data for a tenant.
 * Includes alert counts, sensor status, and recent activity.
 * 
 * @param {string} tenantId - The tenant ID to fetch dashboard data for
 * @returns {import('@tanstack/react-query').UseQueryResult<Object>} Query result with dashboard data
 * @property {Object} data - Dashboard summary containing counts and statistics
 * @property {boolean} isLoading - True while initial data is loading
 * @property {Error|null} error - Error object if query failed
 * 
 * @example
 * const { data, isLoading, error } = useDashboardSummary(tenantId);
 * if (data) {
 *   console.log(data.alertCount, data.sensorCount);
 * }
 */
export const useDashboardSummary = (tenantId) => {
  return useQuery({
    queryKey: ['dashboard', tenantId],
    queryFn: async () => {
      if (USE_BACKEND_API) {
        return await dashboardAPI.getSummary();
      }
      // Fallback to mock data
      return mockDashboardData;
    },
    enabled: !!tenantId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// ==================== Alerts Queries ====================

/**
 * @typedef {Object} AlertFilters
 * @property {string|null} [severity] - Filter by severity (critical, high, medium, low)
 * @property {string|null} [status] - Filter by status (active, acknowledged, resolved)
 * @property {string} [searchTerm] - Search term to filter alerts by sensor name or message
 */

/**
 * Fetches alert summary/aggregation for dashboard.
 * More efficient than fetching all alerts when only counts are needed.
 * 
 * @param {string} tenantId - The tenant ID (used for query key)
 * @returns {import('@tanstack/react-query').UseQueryResult<Object>} Query result with summary
 * 
 * @example
 * const { data } = useAlertSummary(tenantId);
 * // data: { total: 15, bySeverity: { critical: 2, high: 5, ... }, byStatus: { active: 10, ... } }
 */
export const useAlertSummary = (tenantId) => {
  return useQuery({
    queryKey: ['alerts', 'summary', tenantId],
    queryFn: async () => {
      if (USE_BACKEND_API) {
        return await alertsAPI.getAlertSummary();
      }
      // Fallback to mock calculation
      const total = mockAlerts.length;
      const bySeverity = mockAlerts.reduce((acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        return acc;
      }, {});
      const byStatus = mockAlerts.reduce((acc, alert) => {
        acc[alert.status] = (acc[alert.status] || 0) + 1;
        return acc;
      }, {});
      return { total, bySeverity, byStatus };
    },
    enabled: !!tenantId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Fetches alerts for a tenant with optional filtering.
 * Results are sorted by creation date (newest first).
 * 
 * @param {string} tenantId - The tenant ID to fetch alerts for
 * @param {AlertFilters} [filters={}] - Optional filters to apply
 * @returns {import('@tanstack/react-query').UseQueryResult<Array>} Query result with alerts array
 * 
 * @example
 * const { data: alerts } = useAlerts(tenantId, { severity: 'critical', status: 'active' });
 */
export const useAlerts = (tenantId, filters = {}) => {
  const { severity = null, status = null, searchTerm = '' } = filters;

  return useQuery({
    queryKey: ['alerts', tenantId, { severity, status, searchTerm }],
    queryFn: async () => {
      if (USE_BACKEND_API) {
        const alerts = await alertsAPI.getAlerts({ severity, status });
        
        // Apply client-side search if needed
        if (searchTerm) {
          return alerts.filter(
            alert =>
              alert.sensorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              alert.message?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        return alerts;
      }
      
      // Fallback to mock data
      let filtered = [...mockAlerts];

      if (severity) {
        filtered = filtered.filter(alert => alert.severity === severity);
      }

      if (status) {
        filtered = filtered.filter(alert => alert.status === status);
      }

      if (searchTerm) {
        filtered = filtered.filter(
          alert =>
            alert.sensorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alert.message.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return filtered.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    },
    enabled: !!tenantId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Fetches a single alert by ID.
 * 
 * @param {string} alertId - The alert ID to fetch
 * @returns {import('@tanstack/react-query').UseQueryResult<Object>} Query result with alert object
 */
export const useAlert = (alertId) => {
  return useQuery({
    queryKey: ['alert', alertId],
    queryFn: async () => {
      if (USE_BACKEND_API) {
        return await alertsAPI.getAlert(alertId);
      }
      // Fallback to mock data
      return mockAlerts.find(alert => alert.id === alertId);
    },
    enabled: !!alertId,
  });
};

/**
 * Mutation hook for updating alert status.
 * Automatically invalidates related queries on success.
 * 
 * @returns {import('@tanstack/react-query').UseMutationResult} Mutation result
 * 
 * @example
 * const updateStatus = useUpdateAlertStatus();
 * updateStatus.mutate({ alertId: 'alert-123', status: 'acknowledged' });
 */
export const useUpdateAlertStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ alertId, status }) => {
      if (USE_BACKEND_API) {
        return await alertsAPI.updateAlertStatus(alertId, status);
      }
      
      // Fallback to mock data
      const alert = mockAlerts.find(a => a.id === alertId);
      if (alert) {
        alert.status = status;
        alert.acknowledgedAt = new Date().toISOString();
        alert.acknowledgedBy = 'current-user@workside.com';
      }
      
      return alert;
    },
    onSuccess: (updatedAlert) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      if (updatedAlert?.id) {
        queryClient.invalidateQueries({ queryKey: ['alert', updatedAlert.id] });
      }
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      console.error('Failed to update alert status:', error);
      // Toast notification would be handled by the component
    },
  });
};

/**
 * Mutation hook for deleting an alert.
 * Automatically invalidates related queries on success.
 * 
 * @returns {import('@tanstack/react-query').UseMutationResult} Mutation result
 * 
 * @example
 * const deleteAlert = useDeleteAlert();
 * deleteAlert.mutate('alert-123');
 */
export const useDeleteAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId) => {
      if (USE_BACKEND_API) {
        return await alertsAPI.deleteAlert(alertId);
      }
      
      // Fallback to mock data
      const index = mockAlerts.findIndex(a => a.id === alertId);
      if (index !== -1) {
        mockAlerts.splice(index, 1);
      }
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      console.error('Failed to delete alert:', error);
    },
  });
};

// ==================== Sensors Queries ====================

/**
 * Fetches all sensors for a tenant.
 * 
 * @param {string} tenantId - The tenant ID to fetch sensors for
 * @returns {import('@tanstack/react-query').UseQueryResult<Array>} Query result with sensors array
 */
export const useSensors = (tenantId) => {
  return useQuery({
    queryKey: ['sensors', tenantId],
    queryFn: async () => {
      if (USE_BACKEND_API) {
        return await sensorsAPI.getSensors();
      }
      // Fallback to mock data
      return mockSensors;
    },
    enabled: !!tenantId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Fetches a single sensor by ID.
 * 
 * @param {string} sensorId - The sensor ID to fetch
 * @returns {import('@tanstack/react-query').UseQueryResult<Object>} Query result with sensor object
 */
export const useSensor = (sensorId) => {
  return useQuery({
    queryKey: ['sensor', sensorId],
    queryFn: async () => {
      if (USE_BACKEND_API) {
        return await sensorsAPI.getSensor(sensorId);
      }
      // Fallback to mock data
      return mockSensors.find(sensor => sensor.id === sensorId);
    },
    enabled: !!sensorId,
  });
};

/**
 * Fetches time series data for a sensor.
 * 
 * @param {string} sensorId - The sensor ID to fetch time series for
 * @param {string} [period='24h'] - Time period (e.g., '1h', '24h', '7d', '30d')
 * @returns {import('@tanstack/react-query').UseQueryResult<Array>} Query result with time series data
 */
export const useTimeSeries = (sensorId, period = '24h') => {
  return useQuery({
    queryKey: ['timeseries', sensorId, period],
    queryFn: async () => {
      if (USE_BACKEND_API) {
        return await sensorsAPI.getTimeSeries(sensorId, period);
      }
      // Fallback to mock data
      return mockTimeSeriesData(sensorId);
    },
    enabled: !!sensorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

/**
 * Mutation hook for creating a new sensor.
 * Automatically invalidates sensors query on success.
 * 
 * @returns {import('@tanstack/react-query').UseMutationResult} Mutation result
 * 
 * @example
 * const createSensor = useCreateSensor();
 * createSensor.mutate({ name: 'New Sensor', type: 'pressure', location: 'Well A' });
 */
export const useCreateSensor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newSensor) => {
      if (USE_BACKEND_API) {
        return await sensorsAPI.createSensor(newSensor);
      }
      
      // Fallback to mock data
      const sensor = {
        ...newSensor,
        id: `sensor-${Date.now()}`,
      };
      mockSensors.push(sensor);
      
      return sensor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sensors'] });
    },
    onError: (error) => {
      console.error('Failed to create sensor:', error);
    },
  });
};

/**
 * Mutation hook for updating an existing sensor.
 * Automatically invalidates related queries on success.
 * 
 * @returns {import('@tanstack/react-query').UseMutationResult} Mutation result
 * 
 * @example
 * const updateSensor = useUpdateSensor();
 * updateSensor.mutate({ sensorId: 'sensor-123', updates: { status: 'offline' } });
 */
export const useUpdateSensor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sensorId, updates }) => {
      if (USE_BACKEND_API) {
        return await sensorsAPI.updateSensor(sensorId, updates);
      }
      
      // Fallback to mock data
      const sensor = mockSensors.find(s => s.id === sensorId);
      if (sensor) {
        Object.assign(sensor, updates);
      }
      
      return sensor;
    },
    onSuccess: (updatedSensor) => {
      queryClient.invalidateQueries({ queryKey: ['sensors'] });
      if (updatedSensor?.id) {
        queryClient.invalidateQueries({ queryKey: ['sensor', updatedSensor.id] });
      }
    },
    onError: (error) => {
      console.error('Failed to update sensor:', error);
    },
  });
};

/**
 * Mutation hook for deleting a sensor.
 * Automatically invalidates related queries on success.
 * 
 * @returns {import('@tanstack/react-query').UseMutationResult} Mutation result
 * 
 * @example
 * const deleteSensor = useDeleteSensor();
 * deleteSensor.mutate('sensor-123');
 */
export const useDeleteSensor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sensorId) => {
      if (USE_BACKEND_API) {
        return await sensorsAPI.deleteSensor(sensorId);
      }
      
      // Fallback to mock data
      const index = mockSensors.findIndex(s => s.id === sensorId);
      if (index !== -1) {
        mockSensors.splice(index, 1);
      }
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sensors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      console.error('Failed to delete sensor:', error);
    },
  });
};

// ==================== AI Queries ====================

/**
 * @typedef {Object} AIExplanation
 * @property {string} explanation - AI-generated explanation of the alert
 * @property {string} confidence - Confidence level of the explanation
 * @property {string} timestamp - ISO timestamp of when explanation was generated
 */

/**
 * Mutation hook for getting AI explanation of an alert.
 * Uses OpenAI to analyze alert context and provide insights.
 * 
 * @returns {import('@tanstack/react-query').UseMutationResult<AIExplanation>} Mutation result
 * 
 * @example
 * const explainAlert = useAIExplainAlert();
 * explainAlert.mutate({ alert, sensor, recentData });
 */
export const useAIExplainAlert = () => {
  return useMutation({
    mutationFn: async ({ alert, sensor, recentData }) => {
      if (USE_BACKEND_API) {
        return await aiAPI.explainAlert(alert, sensor, recentData);
      }
      
      // Fallback stub response
      return {
        explanation: 'AI explanation not available in mock mode. Enable backend API to use this feature.',
        confidence: 'n/a',
        timestamp: new Date().toISOString(),
      };
    },
    onError: (error) => {
      console.error('AI explanation failed:', error);
    },
  });
};

/**
 * Mutation hook for getting AI-suggested actions for an alert.
 * 
 * @returns {import('@tanstack/react-query').UseMutationResult} Mutation result
 */
export const useAISuggestActions = () => {
  return useMutation({
    mutationFn: async ({ alert, sensor }) => {
      if (USE_BACKEND_API) {
        return await aiAPI.suggestActions(alert, sensor);
      }
      
      // Fallback stub response
      return {
        actions: 'AI suggested actions not available in mock mode. Enable backend API to use this feature.',
        timestamp: new Date().toISOString(),
      };
    },
    onError: (error) => {
      console.error('AI action suggestion failed:', error);
    },
  });
};

/**
 * Mutation hook for AI-powered anomaly detection in sensor data.
 * 
 * @returns {import('@tanstack/react-query').UseMutationResult} Mutation result
 */
export const useAIDetectAnomalies = () => {
  return useMutation({
    mutationFn: async ({ sensorId, timeSeriesData }) => {
      if (USE_BACKEND_API) {
        return await aiAPI.detectAnomalies(sensorId, timeSeriesData);
      }
      
      // Fallback stub response
      return {
        sensorId,
        analysis: 'AI anomaly detection not available in mock mode. Enable backend API to use this feature.',
        statistics: null,
        timestamp: new Date().toISOString(),
      };
    },
    onError: (error) => {
      console.error('AI anomaly detection failed:', error);
    },
  });
};

