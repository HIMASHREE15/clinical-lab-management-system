import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

import { LandingPage } from './components/landing/LandingPage';
import { PublicReportVerificationPage } from './pages/public/PublicReportVerificationPage';
import { LoginPage } from './pages/LoginPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { DashboardPage } from './pages/DashboardPage';
import { SamplesPage } from './pages/SamplesPage';
import { SampleDetailPage } from './pages/SampleDetailPage';
import { ResultEntryPage } from './pages/ResultEntryPage';
import { ReportPage } from './pages/ReportPage';
import { PatientsPage } from './pages/PatientsPage';
import { PatientProfilePage } from './pages/PatientProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';
import { UserRole } from './types';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) {
    return <div className="p-10 text-center text-xs text-slate-400">Loading Session...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && user) {
    const isTech = user.role === 'Laboratory Technician' || user.role === 'Lab Technician';
    const hasRole = allowedRoles.some((r) => r === user.role || (isTech && (r === 'Laboratory Technician' || r === 'Lab Technician')));
    if (!hasRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }
  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/verify-report/:reportId" element={<PublicReportVerificationPage />} />

      {/* Protected Enterprise Portal Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/samples" element={<ProtectedRoute><SamplesPage /></ProtectedRoute>} />
      <Route path="/samples/new" element={<Navigate to="/samples?new=true" replace />} />
      <Route path="/samples/:sampleId" element={<ProtectedRoute><SampleDetailPage /></ProtectedRoute>} />
      <Route path="/result-entry/:sampleId" element={<ProtectedRoute allowedRoles={['Administrator', 'Laboratory Technician', 'Lab Technician']}><ResultEntryPage /></ProtectedRoute>} />
      <Route path="/results" element={<ProtectedRoute><SamplesPage /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><SamplesPage /></ProtectedRoute>} />
      <Route path="/report/:sampleId" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
      <Route path="/patients" element={<ProtectedRoute allowedRoles={['Administrator', 'Laboratory Technician', 'Lab Technician', 'Doctor', 'Receptionist']}><PatientsPage /></ProtectedRoute>} />
      <Route path="/patients/:patientId" element={<ProtectedRoute allowedRoles={['Administrator', 'Laboratory Technician', 'Lab Technician', 'Doctor', 'Receptionist', 'Patient']}><PatientProfilePage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/audit-logs" element={<ProtectedRoute allowedRoles={['Administrator']}><AuditLogsPage /></ProtectedRoute>} />
      <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['Administrator']}><AdminPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
