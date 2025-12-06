import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardAPI, alertsAPI, sensorsAPI, aiAPI } from '../services/api-client';
import {
  mockDashboardData,
  mockAlerts,
  mockSensors,
  mockTimeSeriesData,
} from '../services/mock-data';

// Toggle between API and mock data
const USE_BACKEND_API = import.meta.env.VITE_USE_BACKEND_API === 'true';

// ==================== Dashboard Queries ====================

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
  });
};

// ==================== Sensors Queries ====================

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
  });
};

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
  });
};

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
  });
};

// ==================== AI Queries ====================

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
  });
};

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
  });
};

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
  });
};

