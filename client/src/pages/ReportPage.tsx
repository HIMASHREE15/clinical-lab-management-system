import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ReportView } from '../components/results/ReportView';
import { Clock, ArrowLeft, FlaskConical, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { ISample, IResult, IPatient } from '../types';

export const ReportPage: React.FC = () => {
  const { sampleId } = useParams<{ sampleId: string }>();
  const [sample, setSample] = useState<ISample | null>(null);
  const [result, setResult] = useState<IResult | null>(null);
  const [patient, setPatient] = useState<IPatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadReportData = async () => {
      try {
        const targetId = sampleId || 'SMP1002';
        const res = await api.get(`/samples/${targetId}`);
        setSample(res.data.sample);
        setResult(res.data.result || null);
        setPatient(res.data.patient || null);
      } catch (err: any) {
        console.error('Failed to load report page:', err);
        setError(err.response?.data?.message || 'Sample or report not found');
      } finally {
        setLoading(false);
      }
    };
    loadReportData();
  }, [sampleId]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex print:bg-white">
      <div className="print:hidden">
        <Sidebar />
      </div>
      <div className="flex-1 ml-64 print:ml-0">
        <div className="print:hidden">
          <Navbar />
        </div>
        <main className="pt-20 px-6 pb-12 print:p-0 print:pt-0">
          <div className="print:hidden">
            <Breadcrumbs items={[{ label: 'Reports', path: '/reports' }, { label: `Report ${sampleId}` }]} />
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400 animate-pulse">Rendering official laboratory report...</div>
          ) : error || !sample ? (
            <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-4 shadow-soft">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Report Not Found</h3>
              <p className="text-xs text-slate-500">{error || 'Unable to locate sample record.'}</p>
              <button
                onClick={() => navigate('/samples')}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700"
              >
                Back to Samples
              </button>
            </div>
          ) : !result ? (
            <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-4 shadow-soft">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">Results Pending</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Sample <span className="font-mono font-bold text-purple-600">{sample.sampleId}</span> is currently at stage{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    "{sample.status.replace(/_/g, ' ')}"
                  </span>
                  . The laboratory analysis has not been published or released yet.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => navigate(`/samples/${sample.sampleId}`)}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 flex items-center gap-1.5"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Track Life-Cycle Timeline</span>
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Go Back
                </button>
              </div>
            </div>
          ) : (
            <ReportView
              sample={sample}
              result={result}
              patient={
                patient || {
                  _id: typeof sample.patientId === 'string' ? sample.patientId : (sample.patientId as any)._id,
                  patientId: 'PT1000',
                  name: sample.patientName,
                  age: 30,
                  gender: 'Female',
                  contact: '+1 555-000-0000',
                  createdAt: new Date().toISOString(),
                }
              }
            />
          )}
        </main>
      </div>
    </div>
  );
};
