import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { registerLicense } from '@syncfusion/ej2-base';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components';
import { queryClient } from './config/query-client';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AlertsPage } from './pages/AlertsPage';
import { SensorsPage } from './pages/SensorsPage';
import { SensorDetailPage } from './pages/SensorDetailPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { TenantsPage } from './pages/TenantsPage';
import { TeamPage } from './pages/TeamPage';

// Register Syncfusion license from environment variable
const syncfusionKey = import.meta.env.VITE_SYNCFUSION_KEY;
if (syncfusionKey) {
  registerLicense(syncfusionKey);
} else {
  console.warn('Syncfusion license key is not set');
  console.warn('Please set the VITE_SYNCFUSION_KEY environment variable in your .env file');
  console.warn('Get a free trial license from https://www.syncfusion.com/account/manage-subscriptions');
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/alerts"
              element={
                <ProtectedRoute>
                  <AlertsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sensors"
              element={
                <ProtectedRoute>
                  <SensorsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sensors/:sensorId"
              element={
                <ProtectedRoute>
                  <SensorDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team"
              element={
                <ProtectedRoute>
                  <TeamPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes (Super Admin Only) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tenants"
              element={
                <ProtectedRoute>
                  <TenantsPage />
                </ProtectedRoute>
              }
            />

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
