import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { registerLicense } from '@syncfusion/ej2-base';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components';
import { queryClient } from './config/query-client';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoadingState } from './components/LoadingState';

// Lazy load less frequently accessed pages for better initial load performance
const AlertsPage = lazy(() => import('./pages/AlertsPage').then(m => ({ default: m.AlertsPage })));
const SensorsPage = lazy(() => import('./pages/SensorsPage').then(m => ({ default: m.SensorsPage })));
const SensorDetailPage = lazy(() => import('./pages/SensorDetailPage').then(m => ({ default: m.SensorDetailPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const TenantsPage = lazy(() => import('./pages/TenantsPage').then(m => ({ default: m.TenantsPage })));
const TeamPage = lazy(() => import('./pages/TeamPage').then(m => ({ default: m.TeamPage })));
const DemoControlPage = lazy(() => import('./pages/DemoControlPage'));
const AuditLogsPage = lazy(() => import('./pages/AuditLogsPage'));

/**
 * Page loading fallback component
 */
const PageLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <LoadingState message="Loading page..." size="large" />
  </div>
);

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
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

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
                  <Suspense fallback={<PageLoadingFallback />}>
                    <AlertsPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sensors"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoadingFallback />}>
                    <SensorsPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sensors/:sensorId"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoadingFallback />}>
                    <SensorDetailPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoadingFallback />}>
                    <SettingsPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/team"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoadingFallback />}>
                    <TeamPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes (Super Admin Only) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoadingFallback />}>
                    <AdminDashboardPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tenants"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoadingFallback />}>
                    <TenantsPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/demo"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoadingFallback />}>
                    <DemoControlPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoadingFallback />}>
                    <AuditLogsPage />
                  </Suspense>
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
