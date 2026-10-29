import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Plus, Search, Filter, QrCode, ArrowUpDown } from 'lucide-react';
import { ISample } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface SampleTableProps {
  samples: ISample[];
  onNewSampleClick?: () => void;
  onQRClick?: (sample: ISample) => void;
}

export const SampleTable: React.FC<SampleTableProps> = ({ samples, onNewSampleClick, onQRClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const navigate = useNavigate();

  const filteredSamples = samples.filter((s) => {
    const matchesSearch =
      s.sampleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.testName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-soft overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-700/70 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Samples Tracking Directory</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time status monitoring & chain-of-custody</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Sample ID or Patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40 w-56"
            />
          </div>

          {/* Status Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          >
            <option value="ALL">All Statuses</option>
            <option value="REGISTERED">Registered</option>
            <option value="COLLECTED">Collected</option>
            <option value="RECEIVED_IN_LAB">Received in Lab</option>
            <option value="UNDER_ANALYSIS">Under Testing</option>
            <option value="RESULT_GENERATED">Result Generated</option>
            <option value="DOCTOR_VERIFIED">Doctor Verified</option>
            <option value="DELIVERED">Completed</option>
          </select>

          {/* New Sample Button */}
          {onNewSampleClick && (
            <button
              onClick={onNewSampleClick}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs shadow-md shadow-purple-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Sample</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700">
            <tr>
              <th className="py-3 px-4">Sample ID</th>
              <th className="py-3 px-4">Patient Name</th>
              <th className="py-3 px-4">Test Requested</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Collected On</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {filteredSamples.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                  No laboratory samples match the current query.
                </td>
              </tr>
            ) : (
              filteredSamples.map((sample) => (
                <tr key={sample._id} className="hover:bg-purple-50/40 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-purple-700 dark:text-purple-400 font-mono flex items-center gap-2">
                    <span>{sample.sampleId}</span>
                    {onQRClick && (
                      <button
                        onClick={() => onQRClick(sample)}
                        className="text-slate-400 hover:text-purple-600 transition-colors"
                        title="View QR Code & Barcode"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">
                    {sample.patientName}
                    <span className="block text-[10px] text-slate-400 font-normal">{sample.patientAgeGender}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{sample.testName}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={sample.priority} size="sm" />
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={sample.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                    {new Date(sample.collectedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => navigate(`/samples/${sample.sampleId}`)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-purple-100 hover:text-purple-700 dark:hover:bg-purple-900 dark:hover:text-purple-300 transition-colors"
                      title="View Sample Details & Timeline"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
