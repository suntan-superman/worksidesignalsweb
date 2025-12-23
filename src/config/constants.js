/**
 * @fileoverview Shared constants for Workside Signals web application.
 * Centralizes magic numbers and strings for better maintainability.
 */

/**
 * Alert severity levels
 */
export const ALERT_SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

/**
 * Alert severity colors for UI
 */
export const SEVERITY_COLORS = {
  [ALERT_SEVERITY.CRITICAL]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    badge: 'bg-red-500',
  },
  [ALERT_SEVERITY.HIGH]: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
    badge: 'bg-orange-500',
  },
  [ALERT_SEVERITY.MEDIUM]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    badge: 'bg-yellow-500',
  },
  [ALERT_SEVERITY.LOW]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    badge: 'bg-blue-500',
  },
};

/**
 * Alert status values
 */
export const ALERT_STATUS = {
  ACTIVE: 'active',
  ACKNOWLEDGED: 'acknowledged',
  RESOLVED: 'resolved',
};

/**
 * Alert status colors for UI
 */
export const STATUS_COLORS = {
  [ALERT_STATUS.ACTIVE]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    dot: 'bg-red-500',
  },
  [ALERT_STATUS.ACKNOWLEDGED]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    dot: 'bg-yellow-500',
  },
  [ALERT_STATUS.RESOLVED]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    dot: 'bg-green-500',
  },
};

/**
 * Sensor status values
 */
export const SENSOR_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  WARNING: 'warning',
  ERROR: 'error',
};

/**
 * Sensor status colors for UI
 */
export const SENSOR_STATUS_COLORS = {
  [SENSOR_STATUS.ONLINE]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    dot: 'bg-green-500',
  },
  [SENSOR_STATUS.OFFLINE]: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    dot: 'bg-gray-500',
  },
  [SENSOR_STATUS.WARNING]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    dot: 'bg-yellow-500',
  },
  [SENSOR_STATUS.ERROR]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    dot: 'bg-red-500',
  },
};

/**
 * User roles
 */
export const USER_ROLES = {
  SUPER_ADMIN: 'super-admin',
  TENANT_ADMIN: 'tenant-admin',
  OPERATOR: 'operator',
  VIEWER: 'viewer',
};

/**
 * Sensor types
 */
export const SENSOR_TYPES = {
  PRESSURE: 'pressure',
  TEMPERATURE: 'temperature',
  FLOW_RATE: 'flow_rate',
  VIBRATION: 'vibration',
  LEVEL: 'level',
  GAS_DETECTOR: 'gas_detector',
};

/**
 * Sensor type display labels
 */
export const SENSOR_TYPE_LABELS = {
  [SENSOR_TYPES.PRESSURE]: 'Pressure',
  [SENSOR_TYPES.TEMPERATURE]: 'Temperature',
  [SENSOR_TYPES.FLOW_RATE]: 'Flow Rate',
  [SENSOR_TYPES.VIBRATION]: 'Vibration',
  [SENSOR_TYPES.LEVEL]: 'Level',
  [SENSOR_TYPES.GAS_DETECTOR]: 'Gas Detector',
};

/**
 * Standard units by sensor type
 */
export const SENSOR_UNITS = {
  [SENSOR_TYPES.PRESSURE]: 'PSI',
  [SENSOR_TYPES.TEMPERATURE]: '°F',
  [SENSOR_TYPES.FLOW_RATE]: 'bbl/day',
  [SENSOR_TYPES.VIBRATION]: 'mm/s',
  [SENSOR_TYPES.LEVEL]: 'ft',
  [SENSOR_TYPES.GAS_DETECTOR]: 'ppm',
};

/**
 * Time periods for data queries
 */
export const TIME_PERIODS = [
  { value: '1h', label: 'Last Hour' },
  { value: '4h', label: 'Last 4 Hours' },
  { value: '12h', label: 'Last 12 Hours' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
];

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

/**
 * Query stale times (in milliseconds)
 */
export const QUERY_STALE_TIME = {
  DASHBOARD: 2 * 60 * 1000, // 2 minutes
  ALERTS: 1 * 60 * 1000, // 1 minute
  SENSORS: 2 * 60 * 1000, // 2 minutes
  TIME_SERIES: 5 * 60 * 1000, // 5 minutes
};

/**
 * Date format strings
 */
export const DATE_FORMATS = {
  SHORT: 'MM/DD/YYYY',
  LONG: 'MMMM D, YYYY',
  WITH_TIME: 'MM/DD/YYYY h:mm A',
  TIME_ONLY: 'h:mm A',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
};
