import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { AdminDashboardView } from '../components/dashboard/AdminDashboardView';
import { TechDashboardView } from '../components/dashboard/TechDashboardView';
import { DoctorDashboardView } from '../components/dashboard/DoctorDashboardView';
import { ReceptionDashboardView } from '../components/dashboard/ReceptionDashboardView';
import { PatientDashboardView } from '../components/dashboard/PatientDashboardView';
import { NewSampleModal } from '../components/samples/NewSampleModal';
import { NewPatientModal } from '../components/patients/NewPatientModal';
import api from '../services/api';
import { IDashboardAnalytics, ISample, IPatient, ITestCatalog } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'Patient';
  const [analytics, setAnalytics] = useState<IDashboardAnalytics | null>(null);
  const [samples, setSamples] = useState<ISample[]>([]);
  const [patients, setPatients] = useState<IPatient[]>([]);
  const [tests, setTests] = useState<ITestCatalog[]>([]);

  const [isNewSampleOpen, setIsNewSampleOpen] = useState(false);
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [analyticsRes, samplesRes, patientsRes, testsRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/samples'),
        role === 'Patient' ? Promise.resolve({ data: { patients: [] } }) : api.get('/patients'),
        role === 'Patient' ? Promise.resolve({ data: { tests: [] } }) : api.get('/admin/test-catalog'),
      ]);

      setAnalytics(analyticsRes.data);
      setSamples(samplesRes.data.samples || []);
      setPatients(patientsRes.data.patients || []);
      setTests(testsRes.data.tests || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <main className="pt-20 px-6 pb-12">
          {/* Header Title */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                {role === 'Administrator' && 'System Admin Dashboard'}
                {(role === 'Laboratory Technician' || role === 'Lab Technician') && 'Technician Workstation Dashboard'}
                {role === 'Doctor' && 'Pathologist Verification Dashboard'}
                {role === 'Receptionist' && 'Reception & Intake Dashboard'}
                {role === 'Patient' && 'Welcome to Your Laboratory Portal'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Welcome back, {user?.name || 'User'} | {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Render Role Specific View */}
          {loading || !analytics ? (
            <div className="py-20 text-center text-slate-400 text-xs animate-pulse">
              Loading enterprise analytics telemetry...
            </div>
          ) : (
            <>
              {role === 'Administrator' && <AdminDashboardView analytics={analytics} />}
              {(role === 'Laboratory Technician' || role === 'Lab Technician') && <TechDashboardView analytics={analytics} samples={samples} />}
              {role === 'Doctor' && <DoctorDashboardView samples={samples} />}
              {role === 'Receptionist' && (
                <ReceptionDashboardView
                  samples={samples}
                  onNewSampleClick={() => setIsNewSampleOpen(true)}
                  onNewPatientClick={() => setIsNewPatientOpen(true)}
                />
              )}
              {role === 'Patient' && <PatientDashboardView samples={samples} />}
            </>
          )}

          {/* New Sample Modal */}
          {isNewSampleOpen && (
            <NewSampleModal
              patients={patients}
              tests={tests}
              onClose={() => setIsNewSampleOpen(false)}
              onSuccess={fetchData}
            />
          )}

          {/* New Patient Modal */}
          {isNewPatientOpen && (
            <NewPatientModal
              onClose={() => setIsNewPatientOpen(false)}
              onSuccess={fetchData}
            />
          )}
        </main>
      </div>
    </div>
  );
};
