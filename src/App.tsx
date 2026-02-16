import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminMenuPage from './pages/AdminMenuPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminProfilePage from './pages/AdminProfilePage';
import MonitorLogin from './pages/MonitorLogin';
import OrderMonitor from './pages/OrderMonitor';
import { ErrorBoundary } from './components/ErrorBoundary';

import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { AudioProvider } from './context/AudioContext';
import { ProtectedAdminRoute } from './components/ProtectedAdminRoute';

const MonitorProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Loading...</div>;
  }

  // Allow any authenticated user to see the monitor (Admin or Monitor)
  // We could strictly check email, but for now just auth is sufficient as the route is protected
  return currentUser ? <>{children}</> : <Navigate to="/monitor-login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedAdminRoute>
                <AdminOrdersPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/menu"
            element={
              <ProtectedAdminRoute>
                <AdminMenuPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedAdminRoute>
                <AnalyticsDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedAdminRoute>
                <AdminSettingsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedAdminRoute>
                <AdminProfilePage />
              </ProtectedAdminRoute>
            }
          />
          <Route path="/monitor-login" element={<MonitorLogin />} />
          <Route
            path="/monitor"
            element={
              <ErrorBoundary fallbackMessage="Failed to load Order Monitor. Check Supabase configuration.">
                <MonitorProtectedRoute>
                  <AudioProvider>
                    <OrderMonitor />
                  </AudioProvider>
                </MonitorProtectedRoute>
              </ErrorBoundary>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
