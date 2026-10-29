import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SampleTimeline } from '../components/samples/SampleTimeline';
import { StatusBadge } from '../components/common/StatusBadge';
import { FileEdit, FileText, QrCode, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { ISample, IResult, IPatient } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { WORKFLOW_STAGES } from '../config/constants';

export const SampleDetailPage: React.FC = () => {
  const { sampleId } = useParams<{ sampleId: string }>();
  const [sample, setSample] = useState<ISample | null>(null);
  const [result, setResult] = useState<IResult | null>(null);
  const [patient, setPatient] = useState<IPatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const fetchSampleDetails = async () => {
    try {
      const res = await api.get(`/samples/${sampleId}`);
      setSample(res.data.sample);
      setResult(res.data.result || null);
      setPatient(res.data.patient || null);
    } catch (err) {
      console.error('Failed to load sample detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSampleDetails();
  }, [sampleId]);

  const handleAdvanceStatus = async () => {
    if (!sample) return;
    const currentIdx = WORKFLOW_STAGES.findIndex((s: { id: string }) => s.id === sample.status);
    if (currentIdx < WORKFLOW_STAGES.length - 1) {
      const nextStage = WORKFLOW_STAGES[currentIdx + 1];
      setIsUpdatingStatus(true);
      try {
        await api.patch(`/samples/${sample.sampleId}/status`, {
          status: nextStage.id,
          remarks: `Transitioned to ${nextStage.label}`,
          location: 'Lab Operations Station',
        });
        showToast('Status Advanced', `Sample transitioned to '${nextStage.label}'`, 'success');
        fetchSampleDetails();
      } catch (err: any) {
        showToast('Update Failed', err.response?.data?.message || 'Error updating status', 'error');
      } finally {
        setIsUpdatingStatus(false);
      }
    }
  };

  const handleDoctorVerify = async () => {
    if (!sample) return;
    try {
      await api.post(`/results/verify/${sample.sampleId}`, {
        doctorNotes: 'Results verified and approved for release.',
        releaseImmediately: true,
      });
      showToast('Result Approved', 'Doctor verification recorded and report released.', 'success');
      fetchSampleDetails();
    } catch (err: any) {
      showToast('Verification Failed', err.response?.data?.message || 'Error approving result', 'error');
    }
  };

  if (loading || !sample) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Navbar />
          <div className="pt-24 px-6 text-center text-xs text-slate-400">Loading sample details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <main className="pt-20 px-6 pb-12">
          <Breadcrumbs items={[{ label: 'Samples', path: '/samples' }, { label: sample.sampleId }]} />

          {/* Sample Details Split Layout (Matches Mockup #4) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Card: Sample Details Info */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-soft space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">Sample Details</h3>
                  <StatusBadge status={sample.status} size="sm" />
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Sample ID</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400 font-mono text-base">{sample.sampleId}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Patient Name</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{sample.patientName}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Age / Gender</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{sample.patientAgeGender}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Test Name</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{sample.testName} ({sample.testCode})</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Collected On</span>
                    <span className="font-mono text-slate-600 dark:text-slate-300">
                      {new Date(sample.collectedAt).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Assigned Technician</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{sample.assignedTechName || 'Nurse Revathi'}</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
                  {(user?.role === 'Laboratory Technician' || user?.role === 'Lab Technician' || user?.role === 'Administrator') && (
                    <button
                      onClick={() => navigate(`/result-entry/${sample.sampleId}`)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all"
                    >
                      <FileEdit className="w-4 h-4" />
                      <span>{result ? 'Edit Test Results' : 'Enter Test Results'}</span>
                    </button>
                  )}

                  {user?.role === 'Doctor' && result && !result.isVerifiedByDoctor && (
                    <button
                      onClick={handleDoctorVerify}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Approve &amp; Verify Result</span>
                    </button>
                  )}

                  {result && (
                    <button
                      onClick={() => navigate(`/report/${sample.sampleId}`)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-xs transition-all"
                    >
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span>View Official Lab Report</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Card: Step-by-Step 10-Stage Lifecycle Timeline */}
            <div className="lg:col-span-2">
              <SampleTimeline sample={sample} onAdvanceStatusClick={handleAdvanceStatus} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
