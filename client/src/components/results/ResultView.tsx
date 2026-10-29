import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { ISample, IResult } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { MedicalDisclaimerAlert } from '../common/MedicalDisclaimerAlert';
import { useAuth } from '../../context/AuthContext';

interface ResultViewProps {
  samples: ISample[];
  resultsMap: Map<string, IResult>;
  onVerifyResult?: (sampleId: string) => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ samples, resultsMap, onVerifyResult }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Patient Header Summary (Matches Mockup #6) */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300 bg-purple-800/80 px-2.5 py-1 rounded-full border border-purple-700">
            Patient Portal & Results Summary
          </span>
          <h2 className="text-xl font-extrabold mt-2 tracking-tight">My Test Results</h2>
          <p className="text-xs text-purple-200 mt-0.5">
            Verified electronic health records & downloadable PDF lab reports
          </p>
        </div>

        <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/15 text-xs">
          <div>
            <span className="text-purple-300 block text-[10px]">Patient Name</span>
            <span className="font-bold text-white text-sm">{user?.name || 'Anitha R'}</span>
          </div>
          <div className="border-l border-white/20 pl-4">
            <span className="text-purple-300 block text-[10px]">Patient ID</span>
            <span className="font-mono font-bold text-white text-sm">PT1002</span>
          </div>
          <div className="border-l border-white/20 pl-4">
            <span className="text-purple-300 block text-[10px]">Age / Gender</span>
            <span className="font-semibold text-white">28 / Female</span>
          </div>
        </div>
      </div>

      <MedicalDisclaimerAlert />

      {/* Results Table (Matches Mockup #6) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Laboratory Diagnostic Reports</h3>
          <span className="text-xs text-slate-400 font-mono">{samples.length} Total Record(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Sample ID</th>
                <th className="py-3 px-4">Test Name</th>
                <th className="py-3 px-4">Collected On</th>
                <th className="py-3 px-4">Result Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {samples.map((sample) => {
                const resData = resultsMap.get(sample.sampleId);
                const isReady = sample.status === 'RELEASED' || sample.status === 'DELIVERED' || sample.status === 'RESULT_GENERATED' || sample.status === 'DOCTOR_VERIFIED';

                return (
                  <tr key={sample._id} className="hover:bg-purple-50/40 dark:hover:bg-slate-700/30">
                    <td className="py-3.5 px-4 font-bold text-purple-700 dark:text-purple-400 font-mono">{sample.sampleId}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-100">{sample.testName}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {new Date(sample.collectedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={sample.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {isReady ? (
                        <>
                          <button
                            onClick={() => navigate(`/report/${sample.sampleId}`)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-all inline-flex items-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View Report</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-slate-400 text-xs italic inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Processing...
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
