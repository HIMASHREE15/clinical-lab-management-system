import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, FileCheck2, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { ISample } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface DoctorDashboardProps {
  samples: ISample[];
}

export const DoctorDashboardView: React.FC<DoctorDashboardProps> = ({ samples }) => {
  const navigate = useNavigate();

  const pendingVerification = samples.filter((s) => s.status === 'RESULT_GENERATED' || s.status === 'QUALITY_CHECK');
  const criticalSamples = samples.filter((s) => s.priority === 'Critical');

  return (
    <div className="space-y-6">
      {/* Doctor Summary Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300 bg-purple-800/80 px-2.5 py-1 rounded-full border border-purple-700">
            Consulting Pathologist Portal
          </span>
          <h2 className="text-xl font-extrabold mt-2 tracking-tight">Clinical Verification Worklist</h2>
          <p className="text-xs text-purple-200 mt-0.5">
            Review laboratory findings, evaluate reference ranges, and approve official reports
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 text-center">
            <span className="block text-2xl font-extrabold text-amber-300">{pendingVerification.length}</span>
            <span className="text-[10px] text-purple-200">Pending Review</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 text-center">
            <span className="block text-2xl font-extrabold text-rose-400">{criticalSamples.length}</span>
            <span className="text-[10px] text-purple-200">Critical Priority</span>
          </div>
        </div>
      </div>

      {/* Pending Verification Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Results Awaiting Doctor Verification</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pathologist sign-off required prior to release</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Sample ID</th>
                <th className="py-2.5 px-3">Patient Name</th>
                <th className="py-2.5 px-3">Test</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Assigned Tech</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {pendingVerification.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                    No results currently pending doctor verification.
                  </td>
                </tr>
              ) : (
                pendingVerification.map((s) => (
                  <tr key={s._id} className="hover:bg-purple-50/40 dark:hover:bg-slate-700/30">
                    <td className="py-2.5 px-3 font-bold text-purple-700 dark:text-purple-400 font-mono">{s.sampleId}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-100">{s.patientName}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{s.testName}</td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={s.priority} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">{s.assignedTechName || 'Nurse Revathi'}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => navigate(`/samples/${s.sampleId}`)}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs transition-all inline-flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verify Result</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
