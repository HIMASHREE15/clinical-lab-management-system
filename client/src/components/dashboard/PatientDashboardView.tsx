import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, FileText, Download, Activity, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ISample } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

interface PatientDashboardProps {
  samples: ISample[];
}

export const PatientDashboardView: React.FC<PatientDashboardProps> = ({ samples }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const latestSample = [...samples].sort(
    (left, right) => new Date(right.collectedAt).getTime() - new Date(left.collectedAt).getTime()
  )[0];

  return (
    <div className="space-y-6">
      {/* Digital Patient ID Card & Portal Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Digital Patient Card */}
        <div className="bg-gradient-to-tr from-purple-700 via-purple-800 to-indigo-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
              <span className="text-[10px] font-mono tracking-widest text-purple-200 uppercase font-bold">
                Digital Health Pass
              </span>
              <ShieldCheck className="w-5 h-5 text-purple-300" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold tracking-tight">{user?.name || 'Patient'}</h3>
              <p className="text-xs text-purple-200">Patient ID: {user?.patientId || 'Not assigned'}</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/20 text-xs">
            <span className="text-[10px] text-purple-300 block">Tracked laboratory orders</span>
            <span className="font-bold text-white text-sm">{samples.length}</span>
          </div>
        </div>

        {/* Action Callout */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-soft flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              {latestSample ? 'Report Availability Notice' : 'Patient Portal'}
            </span>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mt-2">
              {latestSample ? `${latestSample.testName} status` : 'Welcome to Your Laboratory Portal'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {latestSample
                ? `${latestSample.sampleId} is currently ${latestSample.status.replace(/_/g, ' ').toLowerCase()}.`
                : 'Your account has been created successfully. You currently have no laboratory tests or samples. Once you visit the laboratory and your sample is registered, you will be able to track its progress and view your released reports here.'}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-3">
            {latestSample && (
              <>
                <button
                  onClick={() => navigate(`/report/${latestSample.sampleId}`)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>View &amp; Download Report</span>
                </button>
                <button
                  onClick={() => navigate(`/samples/${latestSample.sampleId}`)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-xs transition-all"
                >
                  Track Life-Cycle Stage
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Active Samples Tracking Directory */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft p-6">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">My Laboratory Orders & Samples</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Sample ID</th>
                <th className="py-2.5 px-3">Test Requested</th>
                <th className="py-2.5 px-3">Date Collected</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {samples.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 px-3 text-center text-xs text-slate-500">
                    No laboratory samples yet. Your records will appear after a laboratory visit.
                  </td>
                </tr>
              )}
              {samples.map((s) => (
                <tr key={s._id} className="hover:bg-purple-50/40 dark:hover:bg-slate-700/30">
                  <td className="py-2.5 px-3 font-bold text-purple-700 dark:text-purple-400 font-mono">{s.sampleId}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-100">{s.testName}</td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono">
                    {new Date(s.collectedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={s.status} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => navigate(`/report/${s.sampleId}`)}
                      className="px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-medium text-xs hover:bg-purple-200 transition-colors"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
