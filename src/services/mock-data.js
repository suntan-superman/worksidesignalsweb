// Mock data for development and testing

export const mockDashboardData = {
  healthScore: 87,
  alertCounts: {
    critical: 2,
    high: 5,
    medium: 12,
    low: 3,
  },
  activeSensors: 24,
  acknowledgedAlerts: 8,
};

export const mockAlerts = [
  {
    id: '1',
    sensorId: 'sensor-1',
    sensorName: 'Temperature Sensor - Well A1',
    severity: 'critical',
    type: 'out-of-range',
    message: 'Temperature exceeded maximum threshold (95°C)',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    status: 'active',
    acknowledgedBy: null,
    acknowledgedAt: null,
  },
  {
    id: '2',
    sensorId: 'sensor-2',
    sensorName: 'Pressure Sensor - Pad B2',
    severity: 'critical',
    type: 'frozen',
    message: 'No data received for 2 hours',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    status: 'active',
    acknowledgedBy: null,
    acknowledgedAt: null,
  },
  {
    id: '3',
    sensorId: 'sensor-3',
    sensorName: 'Flow Rate Sensor - Well C1',
    severity: 'high',
    type: 'spike',
    message: 'Sudden spike detected: 150% increase in 10 minutes',
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    status: 'active',
    acknowledgedBy: null,
    acknowledgedAt: null,
  },
  {
    id: '4',
    sensorId: 'sensor-4',
    sensorName: 'Temperature Sensor - Well A2',
    severity: 'high',
    type: 'out-of-range',
    message: 'Temperature below minimum threshold (5°C)',
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    status: 'acknowledged',
    acknowledgedBy: 'john@workside.com',
    acknowledgedAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: '5',
    sensorId: 'sensor-5',
    sensorName: 'Vibration Sensor - Pump Unit 1',
    severity: 'medium',
    type: 'out-of-range',
    message: 'Vibration levels elevated above normal range',
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
    status: 'active',
    acknowledgedBy: null,
    acknowledgedAt: null,
  },
  {
    id: '6',
    sensorId: 'sensor-6',
    sensorName: 'Pressure Sensor - Pad B1',
    severity: 'medium',
    type: 'missing-data',
    message: 'Data point missing in expected sequence',
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
    status: 'active',
    acknowledgedBy: null,
    acknowledgedAt: null,
  },
  {
    id: '7',
    sensorId: 'sensor-7',
    sensorName: 'Temperature Sensor - Well D1',
    severity: 'low',
    type: 'out-of-range',
    message: 'Temperature slightly above normal range (1°C)',
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
    status: 'acknowledged',
    acknowledgedBy: 'jane@workside.com',
    acknowledgedAt: new Date(Date.now() - 110 * 60000).toISOString(),
  },
];

export const mockSensors = [
  {
    id: 'sensor-1',
    name: 'Temperature Sensor - Well A1',
    type: 'temperature',
    units: '°C',
    wellId: 'well-a1',
    wellName: 'Well A1',
    padId: 'pad-a',
    padName: 'Pad A',
    status: 'active',
    normalRange: { min: 20, max: 80 },
    currentValue: 75,
    lastUpdate: new Date(Date.now() - 2 * 60000).toISOString(),
    ruleSetId: 'ruleset-1',
  },
  {
    id: 'sensor-2',
    name: 'Pressure Sensor - Pad B2',
    type: 'pressure',
    units: 'psi',
    wellId: 'well-b2',
    wellName: 'Well B2',
    padId: 'pad-b',
    padName: 'Pad B',
    status: 'inactive',
    normalRange: { min: 100, max: 300 },
    currentValue: null,
    lastUpdate: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    ruleSetId: 'ruleset-2',
  },
  {
    id: 'sensor-3',
    name: 'Flow Rate Sensor - Well C1',
    type: 'flow-rate',
    units: 'bbl/d',
    wellId: 'well-c1',
    wellName: 'Well C1',
    padId: 'pad-c',
    padName: 'Pad C',
    status: 'active',
    normalRange: { min: 500, max: 2000 },
    currentValue: 1250,
    lastUpdate: new Date(Date.now() - 1 * 60000).toISOString(),
    ruleSetId: 'ruleset-3',
  },
  {
    id: 'sensor-4',
    name: 'Temperature Sensor - Well A2',
    type: 'temperature',
    units: '°C',
    wellId: 'well-a2',
    wellName: 'Well A2',
    padId: 'pad-a',
    padName: 'Pad A',
    status: 'active',
    normalRange: { min: 20, max: 80 },
    currentValue: 45,
    lastUpdate: new Date(Date.now() - 3 * 60000).toISOString(),
    ruleSetId: 'ruleset-1',
  },
  {
    id: 'sensor-5',
    name: 'Vibration Sensor - Pump Unit 1',
    type: 'vibration',
    units: 'mm/s',
    wellId: 'well-a1',
    wellName: 'Well A1',
    padId: 'pad-a',
    padName: 'Pad A',
    status: 'active',
    normalRange: { min: 0, max: 7 },
    currentValue: 8.5,
    lastUpdate: new Date(Date.now() - 4 * 60000).toISOString(),
    ruleSetId: 'ruleset-4',
  },
  {
    id: 'sensor-6',
    name: 'Pressure Sensor - Pad B1',
    type: 'pressure',
    units: 'psi',
    wellId: 'well-b1',
    wellName: 'Well B1',
    padId: 'pad-b',
    padName: 'Pad B',
    status: 'active',
    normalRange: { min: 100, max: 300 },
    currentValue: 210,
    lastUpdate: new Date(Date.now() - 5 * 60000).toISOString(),
    ruleSetId: 'ruleset-2',
  },
];

export const mockTimeSeriesData = (sensorId) => {
  const now = Date.now();
  const dataPoints = [];
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now - i * 60 * 60000);
    let value;
    
    if (sensorId === 'sensor-1') {
      value = 50 + Math.random() * 30; // Temperature
    } else if (sensorId === 'sensor-2') {
      value = 150 + Math.random() * 100; // Pressure
    } else {
      value = 1000 + Math.random() * 500; // Flow rate
    }
    
    dataPoints.push({
      timestamp: timestamp.toISOString(),
      value: Math.round(value * 100) / 100,
      qualityFlag: 'good',
    });
  }
  
  return dataPoints;
};

// Simulated API delays
export const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

