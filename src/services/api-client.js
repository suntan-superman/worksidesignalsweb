import axios from 'axios';
import { getAuthInstance } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://workside-signals-api-b4elbrm5vq-uc.a.run.app';

// Create axios instance
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const auth = getAuthInstance();
      const user = auth.currentUser;
      
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      console.error('Unauthorized - redirecting to login');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== Dashboard API ====================

export const dashboardAPI = {
  getSummary: async () => {
    const response = await apiClient.get('/dashboard/summary');
    return response.data;
  },
};

// ==================== Alerts API ====================

export const alertsAPI = {
  getAlerts: async (filters = {}) => {
    const response = await apiClient.get('/alerts', {
      params: {
        severity: filters.severity,
        status: filters.status,
        sensorId: filters.sensorId,
      },
    });
    return response.data;
  },

  getAlert: async (alertId) => {
    const response = await apiClient.get(`/alerts/${alertId}`);
    return response.data;
  },

  updateAlertStatus: async (alertId, status) => {
    const response = await apiClient.put(`/alerts/${alertId}`, { status });
    return response.data;
  },

  createAlert: async (alertData) => {
    const response = await apiClient.post('/alerts', alertData);
    return response.data;
  },
};

// ==================== Sensors API ====================

export const sensorsAPI = {
  getSensors: async () => {
    const response = await apiClient.get('/sensors');
    return response.data;
  },

  getSensor: async (sensorId) => {
    const response = await apiClient.get(`/sensors/${sensorId}`);
    return response.data;
  },

  getTimeSeries: async (sensorId, period = '24h') => {
    const response = await apiClient.get(`/sensors/${sensorId}/timeseries`, {
      params: { period },
    });
    return response.data;
  },

  createSensor: async (sensorData) => {
    const response = await apiClient.post('/sensors', sensorData);
    return response.data;
  },

  updateSensor: async (sensorId, updates) => {
    const response = await apiClient.put(`/sensors/${sensorId}`, updates);
    return response.data;
  },

  deleteSensor: async (sensorId) => {
    const response = await apiClient.delete(`/sensors/${sensorId}`);
    return response.data;
  },
};

// ==================== AI API ====================

export const aiAPI = {
  explainAlert: async (alert, sensor, recentData) => {
    const response = await apiClient.post('/ai/explain-alert', {
      alert,
      sensor,
      recentData,
    });
    return response.data;
  },

  suggestActions: async (alert, sensor) => {
    const response = await apiClient.post('/ai/suggest-actions', {
      alert,
      sensor,
    });
    return response.data;
  },

  detectAnomalies: async (sensorId, timeSeriesData) => {
    const response = await apiClient.post('/ai/detect-anomalies', {
      sensorId,
      timeSeriesData,
    });
    return response.data;
  },
};

// ==================== Ingestion API ====================

export const ingestionAPI = {
  ingestBatch: async (data) => {
    const response = await apiClient.post('/ingest/batch', { data });
    return response.data;
  },

  ingestSingle: async (dataPoint) => {
    const response = await apiClient.post('/ingest/single', dataPoint);
    return response.data;
  },
};

// Export the base client for custom requests
export default apiClient;

