import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Plus, UserRound } from 'lucide-react';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { NewSampleModal } from '../components/samples/NewSampleModal';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import { IResult, IPatient, ISample, ITestCatalog } from '../types';

export const PatientProfilePage: React.FC = () => {
  const { patientId: routePatientId } = useParams<{ patientId: string }>();
  const { user } = useAuth();
  const patientId = routePatientId === 'me' ? user?.patientId : routePatientId;
  const canRegisterSamples = user?.role === 'Administrator' || user?.role === 'Receptionist';
  const [patient, setPatient] = useState<IPatient | null>(null);
  const [samples, setSamples] = useState<ISample[]>([]);
  const [results, setResults] = useState<IResult[]>([]);
  const [tests, setTests] = useState<ITestCatalog[]>([]);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [updatingSampleId, setUpdatingSampleId] = useState('');
  const { showToast } = useNotification();

  const loadProfile = useCallback(async () => {
    if (!patientId) {
      setErrorMessage('This account does not have a Patient ID assigned.');
      setIsLoading(false);
      return;
    }
    try {
      const [profileResponse, testsResponse] = await Promise.all([
        api.get(`/patients/${encodeURIComponent(patientId)}/history`),
        canRegisterSamples ? api.get('/admin/test-catalog') : Promise.resolve({ data: { tests: [] } }),
      ]);
      setPatient(profileResponse.data.patient);
      setSamples(profileResponse.data.samples || []);
      setResults(profileResponse.data.results || []);
      setTests(testsResponse.data.tests || []);
      setErrorMessage('');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Unable to load this patient profile.');
    } finally {
      setIsLoading(false);
    }
  }, [canRegisterSamples, patientId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const markSampleCollected = async (sample: ISample) => {
    setUpdatingSampleId(sample.sampleId);
    try {
      await api.patch(`/samples/${sample.sampleId}/status`, { status: 'COLLECTED' });
      showToast('Sample Collected', `${sample.sampleId} has entered the laboratory workflow.`, 'success');
      await loadProfile();
    } catch (error: any) {
      showToast('Update Error', error.response?.data?.message || 'Could not update sample status.', 'error');
    } finally {
      setUpdatingSampleId('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100 flex">
      <Sidebar />
      <div className="ml-64 flex-1">
        <Navbar />
        <main className="px-6 pb-12 pt-20">
          <Breadcrumbs items={[{ label: 'Patients', path: user?.role === 'Patient' ? '/dashboard' : '/patients' }, { label: 'Patient Profile' }]} />

          {isLoading ? (
            <p className="py-16 text-center text-sm text-slate-500">Loading patient profile...</p>
          ) : errorMessage ? (
            <section role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{errorMessage}</section>
          ) : patient ? (
            <div className="space-y-6">
              <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    <UserRound className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-mono text-xs font-bold text-purple-700 dark:text-purple-300">{patient.patientId}</p>
                    <h1 className="mt-1 text-xl font-bold">{patient.name}</h1>
                    <p className="mt-1 text-xs text-slate-500">{patient.contact}{patient.email ? ` · ${patient.email}` : ''}</p>
                  </div>
                </div>
                {canRegisterSamples && (
                  <button
                    type="button"
                    onClick={() => setIsSampleModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-800"
                  >
                    <Plus className="h-4 w-4" /> Register Laboratory Sample
                  </button>
                )}
              </section>

              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ProfileField label="Date of Birth" value={patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'Not recorded'} />
                <ProfileField label="Age / Gender" value={`${patient.age} / ${patient.gender}`} />
                <ProfileField label="Address" value={patient.address || 'Not recorded'} />
                <ProfileField label="Emergency Contact" value={patient.emergencyContact || 'Not recorded'} />
              </section>

              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                <div className="border-b border-slate-100 p-5 dark:border-slate-700">
                  <h2 className="text-sm font-bold">Laboratory Samples</h2>
                </div>
                {samples.length === 0 ? (
                  <p className="p-5 text-sm text-slate-500">No laboratory samples are registered for this patient.</p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {samples.map((sample) => (
                      <div key={sample._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                        <div>
                          <Link to={`/samples/${sample.sampleId}`} className="font-mono text-sm font-bold text-purple-700 hover:underline dark:text-purple-300">{sample.sampleId}</Link>
                          <p className="mt-1 text-xs text-slate-500">{sample.testName} · {new Date(sample.collectedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={sample.status} size="sm" />
                          {user?.role === 'Receptionist' && sample.status === 'REGISTERED' && (
                            <button
                              type="button"
                              disabled={updatingSampleId === sample.sampleId}
                              onClick={() => markSampleCollected(sample)}
                              className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                            >
                              {updatingSampleId === sample.sampleId ? 'Updating...' : 'Mark Collected'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                <div className="border-b border-slate-100 p-5 dark:border-slate-700">
                  <h2 className="text-sm font-bold">Test Results</h2>
                </div>
                {results.length === 0 ? (
                  <p className="p-5 text-sm text-slate-500">No test results are available.</p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {results.map((result) => (
                      <div key={result._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                        <div>
                          <p className="text-sm font-semibold">{result.testName}</p>
                          <p className="mt-1 text-xs text-slate-500">Sample {result.sampleId} · {result.releasedAt ? `Released ${new Date(result.releasedAt).toLocaleDateString()}` : 'Pending release'}</p>
                        </div>
                        {result.releasedAt && <Link to={`/report/${result.sampleId}`} className="text-xs font-semibold text-purple-700 hover:underline dark:text-purple-300">Open report</Link>}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          ) : null}
        </main>
      </div>
      {isSampleModalOpen && patient && (
        <NewSampleModal
          patients={[patient]}
          tests={tests}
          onClose={() => setIsSampleModalOpen(false)}
          onSuccess={loadProfile}
        />
      )}
    </div>
  );
};

const ProfileField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
    <p className="text-xs font-semibold text-slate-500">{label}</p>
    <p className="mt-2 break-words text-sm font-medium">{value}</p>
  </div>
);