/**
 * @fileoverview Centralized API client for Workside Signals application.
 * Provides axios-based HTTP client with automatic authentication token injection,
 * request/response interceptors, and organized API service modules.
 */

import axios from 'axios';
import { getAuthInstance } from '../config/firebase';

/** Base URL for the API, configurable via environment variable */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://workside-signals-api-b4elbrm5vq-uc.a.run.app';

/**
 * Axios instance configured for API requests.
 * Includes automatic auth token injection and error handling.
 */
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

/**
 * Request interceptor - adds Firebase auth token to requests
 */
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

/** Flag to prevent multiple redirect attempts */
let isRedirecting = false;

/**
 * Response interceptor - handles common error scenarios
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on cancelled requests
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401 && !isRedirecting) {
      // Prevent infinite redirect loop
      isRedirecting = true;
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        console.error('Unauthorized - redirecting to login');
        // Use replace to avoid back button returning to protected page
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Creates an AbortController signal for request cancellation.
 * Use this when making requests that should be cancellable (e.g., on component unmount).
 * 
 * @returns {{ signal: AbortSignal, cancel: () => void }} Signal and cancel function
 * 
 * @example
 * const { signal, cancel } = createCancelToken();
 * apiClient.get('/endpoint', { signal });
 * // Later: cancel();
 */
export const createCancelToken = () => {
  const controller = new AbortController();
  return {
    signal: controller.signal,
    cancel: () => controller.abort(),
  };
};

// ==================== Dashboard API ====================

/**
 * Dashboard API module
 * @namespace dashboardAPI
 */
export const dashboardAPI = {
  /**
   * Get dashboard summary data including alert counts, sensor status, etc.
   * @param {AbortSignal} [signal] - Optional abort signal for cancellation
   * @returns {Promise<Object>} Dashboard summary data
   */
  getSummary: async (signal) => {
    const response = await apiClient.get('/dashboard/summary', { signal });
    return response.data;
  },
};

// ==================== Alerts API ====================

/**
 * Alerts API module
 * @namespace alertsAPI
 */
export const alertsAPI = {
  /**
   * Get alerts with optional filtering
   * @param {Object} [filters] - Filter options
   * @param {string} [filters.severity] - Filter by severity (critical, high, medium, low)
   * @param {string} [filters.status] - Filter by status (active, acknowledged, resolved)
   * @param {string} [filters.sensorId] - Filter by sensor ID
   * @param {AbortSignal} [signal] - Optional abort signal for cancellation
   * @returns {Promise<Array>} Array of alert objects
   */
  getAlerts: async (filters = {}, signal) => {
    const response = await apiClient.get('/alerts', {
      params: {
        severity: filters.severity,
        status: filters.status,
        sensorId: filters.sensorId,
      },
      signal,
    });
    return response.data;
  },

  /**
   * Get alert summary/aggregation for dashboard
   * Returns counts by severity and status without fetching all alerts
   * @param {AbortSignal} [signal] - Optional abort signal for cancellation
   * @returns {Promise<Object>} Summary with total, bySeverity, byStatus counts
   */
  getAlertSummary: async (signal) => {
    const response = await apiClient.get('/alerts/summary', { signal });
    return response.data;
  },

  /**
   * Get a single alert by ID
   * @param {string} alertId - The alert ID
   * @param {AbortSignal} [signal] - Optional abort signal for cancellation
   * @returns {Promise<Object>} Alert object
   */
  getAlert: async (alertId, signal) => {
    const response = await apiClient.get(`/alerts/${alertId}`, { signal });
    return response.data;
  },

  /**
   * Update alert status
   * @param {string} alertId - The alert ID
   * @param {string} status - New status (active, acknowledged, resolved)
   * @returns {Promise<Object>} Updated alert object
   */
  updateAlertStatus: async (alertId, status) => {
    const response = await apiClient.put(`/alerts/${alertId}`, { status });
    return response.data;
  },

  /**
   * Create a new alert
   * @param {Object} alertData - Alert data
   * @returns {Promise<Object>} Created alert object
   */
  createAlert: async (alertData) => {
    const response = await apiClient.post('/alerts', alertData);
    return response.data;
  },

  /**
   * Delete an alert
   * @param {string} alertId - The alert ID to delete
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteAlert: async (alertId) => {
    const response = await apiClient.delete(`/alerts/${alertId}`);
    return response.data;
  },
};

// ==================== Sensors API ====================

/**
 * Sensors API module
 * @namespace sensorsAPI
 */
export const sensorsAPI = {
  /**
   * Get all sensors for the tenant
   * @param {AbortSignal} [signal] - Optional abort signal for cancellation
   * @returns {Promise<Array>} Array of sensor objects
   */
  getSensors: async (signal) => {
    const response = await apiClient.get('/sensors', { signal });
    return response.data;
  },

  /**
   * Get a single sensor by ID
   * @param {string} sensorId - The sensor ID
   * @param {AbortSignal} [signal] - Optional abort signal for cancellation
   * @returns {Promise<Object>} Sensor object
   */
  getSensor: async (sensorId, signal) => {
    const response = await apiClient.get(`/sensors/${sensorId}`, { signal });
    return response.data;
  },

  /**
   * Get time series data for a sensor
   * @param {string} sensorId - The sensor ID
   * @param {string} [period='24h'] - Time period (1h, 24h, 7d, 30d)
   * @param {AbortSignal} [signal] - Optional abort signal for cancellation
   * @returns {Promise<Array>} Array of time series data points
   */
  getTimeSeries: async (sensorId, period = '24h', signal) => {
    const response = await apiClient.get(`/sensors/${sensorId}/timeseries`, {
      params: { period },
      signal,
    });
    return response.data;
  },

  /**
   * Create a new sensor
   * @param {Object} sensorData - Sensor data
   * @returns {Promise<Object>} Created sensor object
   */
  createSensor: async (sensorData) => {
    const response = await apiClient.post('/sensors', sensorData);
    return response.data;
  },

  /**
   * Update a sensor
   * @param {string} sensorId - The sensor ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated sensor object
   */
  updateSensor: async (sensorId, updates) => {
    const response = await apiClient.put(`/sensors/${sensorId}`, updates);
    return response.data;
  },

  /**
   * Delete a sensor
   * @param {string} sensorId - The sensor ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteSensor: async (sensorId) => {
    const response = await apiClient.delete(`/sensors/${sensorId}`);
    return response.data;
  },
};

// ==================== AI API ====================

/**
 * AI API module - OpenAI-powered analysis features
 * @namespace aiAPI
 */
export const aiAPI = {
  /**
   * Get AI-generated explanation for an alert
   * @param {Object} alert - The alert object
   * @param {Object} sensor - The associated sensor object
   * @param {Array} recentData - Recent sensor readings for context
   * @returns {Promise<Object>} AI explanation with confidence level
   */
  explainAlert: async (alert, sensor, recentData) => {
    const response = await apiClient.post('/ai/explain-alert', {
      alert,
      sensor,
      recentData,
    });
    return response.data;
  },

  /**
   * Get AI-suggested actions for an alert
   * @param {Object} alert - The alert object
   * @param {Object} sensor - The associated sensor object
   * @returns {Promise<Object>} Suggested remediation actions
   */
  suggestActions: async (alert, sensor) => {
    const response = await apiClient.post('/ai/suggest-actions', {
      alert,
      sensor,
    });
    return response.data;
  },

  /**
   * Detect anomalies in sensor time series data
   * @param {string} sensorId - The sensor ID
   * @param {Array} timeSeriesData - Time series data to analyze
   * @returns {Promise<Object>} Anomaly analysis results
   */
  detectAnomalies: async (sensorId, timeSeriesData) => {
    const response = await apiClient.post('/ai/detect-anomalies', {
      sensorId,
      timeSeriesData,
    });
    return response.data;
  },
};

// ==================== Ingestion API ====================

/**
 * Ingestion API module - For data ingestion from PI/Ignition systems
 * @namespace ingestionAPI
 */
export const ingestionAPI = {
  /**
   * Ingest a batch of sensor readings
   * @param {Array} data - Array of sensor reading objects
   * @returns {Promise<Object>} Ingestion result summary
   */
  ingestBatch: async (data) => {
    const response = await apiClient.post('/ingest/batch', { data });
    return response.data;
  },

  /**
   * Ingest a single sensor reading
   * @param {Object} dataPoint - Single sensor reading
   * @returns {Promise<Object>} Ingestion confirmation
   */
  ingestSingle: async (dataPoint) => {
    const response = await apiClient.post('/ingest/single', dataPoint);
    return response.data;
  },
};

/** Export the base axios client for custom requests */
export default apiClient;

