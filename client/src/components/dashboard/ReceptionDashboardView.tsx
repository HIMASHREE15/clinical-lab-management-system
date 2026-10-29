import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, UserPlus, Search, QrCode, ArrowRight } from 'lucide-react';
import { ISample } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface ReceptionDashboardProps {
  samples: ISample[];
  onNewSampleClick: () => void;
  onNewPatientClick: () => void;
}

export const ReceptionDashboardView: React.FC<ReceptionDashboardProps> = ({
  samples,
  onNewSampleClick,
  onNewPatientClick,
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Reception Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Register New Sample</h3>
            <p className="text-xs text-purple-100 mt-1">Intake patient specimen, generate QR & barcode label</p>
            <button
              onClick={onNewSampleClick}
              className="mt-4 px-4 py-2 bg-white text-purple-700 font-bold text-xs rounded-xl shadow-md hover:bg-purple-50 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Intake Sample</span>
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Register New Patient</h3>
            <p className="text-xs text-blue-100 mt-1">Create digital Patient ID & medical history record</p>
            <button
              onClick={onNewPatientClick}
              className="mt-4 px-4 py-2 bg-white text-blue-700 font-bold text-xs rounded-xl shadow-md hover:bg-blue-50 transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Patient</span>
            </button>
          </div>
        </div>
      </div>

      {/* Today's Intake Directory */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft p-6">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Today's Registered Samples</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Sample ID</th>
                <th className="py-2.5 px-3">Patient Name</th>
                <th className="py-2.5 px-3">Test</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {samples.slice(0, 6).map((s) => (
                <tr key={s._id} className="hover:bg-purple-50/40 dark:hover:bg-slate-700/30">
                  <td className="py-2.5 px-3 font-bold text-purple-700 dark:text-purple-400 font-mono">{s.sampleId}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-100">{s.patientName}</td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{s.testName}</td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={s.priority} size="sm" />
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={s.status} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => navigate(`/samples/${s.sampleId}`)}
                      className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-purple-100 font-medium text-xs transition-colors"
                    >
                      Track
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
