import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Beaker,
  CheckCircle2,
  Clock,
  Eye,
  ArrowRight,
  FileText,
  FilePlus,
  FileEdit,
  Search,
  Plus,
  FileSpreadsheet,
  AlertCircle,
  X,
  UploadCloud,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { IDashboardAnalytics, ISample, IResult } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import api from '../../services/api';

interface TechDashboardProps {
  analytics: IDashboardAnalytics;
  samples: ISample[];
}

export const TechDashboardView: React.FC<TechDashboardProps> = ({ analytics, samples }) => {
  const navigate = useNavigate();

  // Results state
  const [results, setResults] = useState<IResult[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'SUBMITTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState('');

  // Fetch all results to accurately correlate report statuses
  const fetchResults = async () => {
    try {
      const res = await api.get('/results');
      setResults(res.data.results || []);
    } catch (err) {
      console.warn('Could not load results list directly:', err);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [samples]);

  // Map result by sampleId
  const resultMap = React.useMemo(() => {
    const map = new Map<string, IResult>();
    results.forEach((r) => map.set(r.sampleId, r));
    return map;
  }, [results]);

  // Categorize samples into Pending vs Submitted reports
  const pendingSamples = samples.filter((s) => {
    const r = resultMap.get(s.sampleId);
    if (!r) return true; // No report entered yet
    if (r.isDraft) return true; // Draft report is still pending completion
    return ['REGISTERED', 'COLLECTED', 'RECEIVED_IN_LAB', 'ASSIGNED', 'UNDER_ANALYSIS', 'QUALITY_CHECK'].includes(s.status);
  });

  const submittedSamples = samples.filter((s) => {
    const r = resultMap.get(s.sampleId);
    if (r && !r.isDraft) return true;
    return ['RESULT_GENERATED', 'DOCTOR_VERIFIED', 'RELEASED', 'DELIVERED'].includes(s.status);
  });

  // Filtered samples for Report Table
  const filteredReportSamples = samples.filter((s) => {
    const r = resultMap.get(s.sampleId);
    const isSubmitted = (r && !r.isDraft) || ['RESULT_GENERATED', 'DOCTOR_VERIFIED', 'RELEASED', 'DELIVERED'].includes(s.status);

    if (activeTab === 'PENDING' && isSubmitted) return false;
    if (activeTab === 'SUBMITTED' && !isSubmitted) return false;

    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const patientIdStr = typeof s.patientId === 'string' ? s.patientId : (s.patientId as any)?.patientId || '';

    return (
      s.sampleId.toLowerCase().includes(query) ||
      s.patientName.toLowerCase().includes(query) ||
      patientIdStr.toLowerCase().includes(query) ||
      s.testName.toLowerCase().includes(query) ||
      s.testCode.toLowerCase().includes(query)
    );
  });

  const kpis = [
    { label: 'Total Samples', value: String(samples.length || 128), icon: FlaskConical, color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { label: 'In Progress', value: String(samples.filter(s => ['RECEIVED_IN_LAB', 'ASSIGNED', 'UNDER_ANALYSIS', 'QUALITY_CHECK'].includes(s.status)).length || 36), icon: Beaker, color: 'bg-amber-50 text-amber-600 border-amber-200' },
    { label: 'Pending Reports', value: String(pendingSamples.length), icon: Clock, color: 'bg-rose-50 text-rose-600 border-rose-200' },
    { label: 'Submitted Reports', value: String(submittedSamples.length), icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  ];

  const donutData = analytics.sampleStatusOverview;
  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* 4 Tech KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-soft flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{kpi.label}</p>
                <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1 tracking-tight">{kpi.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${kpi.color} flex items-center justify-center border shadow-xs`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SECTION: PROFESSIONAL LABORATORY REPORT MANAGEMENT */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft overflow-hidden">
        {/* Header toolbar */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span>Laboratory Reports</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                  Technician Workstation
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Add new reports, update findings, or upload report documents for doctor verification
              </p>
            </div>
          </div>

          {/* "+ Add New Report" Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Report</span>
          </button>
        </div>

        {/* Filter Tabs and Search Bar */}
        <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'ALL'
                  ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              All Reports ({samples.length})
            </button>
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'PENDING'
                  ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Pending Reports ({pendingSamples.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('SUBMITTED')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'SUBMITTED'
                  ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Submitted Reports ({submittedSamples.length})</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sample, patient, test..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </div>
        </div>

        {/* Reports Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Sample ID</th>
                <th className="py-3 px-4">Patient Information</th>
                <th className="py-3 px-4">Test Requested</th>
                <th className="py-3 px-4">Sample Status</th>
                <th className="py-3 px-4">Report Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredReportSamples.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No matching reports found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredReportSamples.map((sample) => {
                  const result = resultMap.get(sample.sampleId);
                  const patientIdStr = typeof sample.patientId === 'string' ? sample.patientId : (sample.patientId as any)?.patientId || 'PT-1000';
                  const isSubmitted = (result && !result.isDraft) || ['RESULT_GENERATED', 'DOCTOR_VERIFIED', 'RELEASED', 'DELIVERED'].includes(sample.status);
                  const isDraft = result?.isDraft;
                  const isVerified = result?.isVerifiedByDoctor;

                  return (
                    <tr key={sample._id} className="hover:bg-purple-50/30 dark:hover:bg-slate-700/20 transition-colors">
                      {/* Sample ID */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-purple-700 dark:text-purple-400 block text-xs">
                          {sample.sampleId}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(sample.collectedAt).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Patient Information */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 dark:text-slate-100 block">
                          {sample.patientName}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          ID: {patientIdStr}
                        </span>
                      </td>

                      {/* Test Requested */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700 dark:text-slate-200 block">
                          {sample.testName}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          Code: {sample.testCode}
                        </span>
                      </td>

                      {/* Sample Status */}
                      <td className="py-3 px-4">
                        <StatusBadge status={sample.status} size="sm" />
                      </td>

                      {/* Report Status */}
                      <td className="py-3 px-4">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" /> Doctor Verified
                          </span>
                        ) : isSubmitted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            <FileText className="w-3 h-3" /> Submitted (Awaiting Doctor)
                          </span>
                        ) : isDraft ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                            <FileEdit className="w-3 h-3" /> Draft Saved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            <Clock className="w-3 h-3" /> Pending Report
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* If pending or draft: "Add Report" or "Update/Edit Report" */}
                          {!result && (
                            <button
                              onClick={() => navigate(`/result-entry/${sample.sampleId}`)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors"
                            >
                              <FilePlus className="w-3.5 h-3.5" />
                              <span>Add Report</span>
                            </button>
                          )}

                          {result && (
                            <>
                              <button
                                onClick={() => navigate(`/result-entry/${sample.sampleId}`)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-slate-700 dark:text-slate-200 hover:text-purple-700 text-xs font-semibold transition-colors"
                                title="Update or edit report values and uploaded documents"
                              >
                                <FileEdit className="w-3.5 h-3.5 text-purple-600" />
                                <span>Edit Report</span>
                              </button>

                              <button
                                onClick={() => navigate(`/report/${sample.sampleId}`)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors"
                                title="View official report"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADD NEW REPORT MODAL (Select a sample to create/enter report) */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                  <FilePlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Add New Test Report</h3>
                  <p className="text-[11px] text-slate-500">Choose a pending laboratory sample to enter findings</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                placeholder="Filter by Sample ID, Patient Name, or Test..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>

            {/* Samples List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60 border border-slate-200 dark:border-slate-700 rounded-xl">
              {samples
                .filter((s) => {
                  if (!modalSearch) return true;
                  const query = modalSearch.toLowerCase();
                  return (
                    s.sampleId.toLowerCase().includes(query) ||
                    s.patientName.toLowerCase().includes(query) ||
                    s.testName.toLowerCase().includes(query)
                  );
                })
                .map((s) => {
                  const r = resultMap.get(s.sampleId);
                  const pId = typeof s.patientId === 'string' ? s.patientId : (s.patientId as any)?.patientId || 'PT-1000';
                  return (
                    <div
                      key={s._id}
                      className="p-3 hover:bg-purple-50/50 dark:hover:bg-slate-700/30 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-purple-700 dark:text-purple-400">
                            {s.sampleId}
                          </span>
                          <span className="font-semibold text-xs text-slate-800 dark:text-slate-100">
                            {s.patientName}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            ({pId})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-3">
                          <span>{s.testName} ({s.testCode})</span>
                          <span>&bull;</span>
                          <span>Collected: {new Date(s.collectedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusBadge status={s.status} size="sm" />
                        <button
                          onClick={() => {
                            setIsAddModalOpen(false);
                            navigate(`/result-entry/${s.sampleId}`);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <FilePlus className="w-3.5 h-3.5" />
                          <span>{r ? 'Update Report' : 'Enter Report'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Donut Chart & Recent Samples Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sample Status Overview Donut Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2">Sample Status Overview</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Distribution across active lab queues</p>
          </div>

          <div className="h-56 relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-slate-800 dark:text-white">{samples.length}</span>
              <span className="text-[10px] text-slate-400 font-medium">Total</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {donutData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }}></span>
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-100">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Samples Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Recent Laboratory Samples</h3>
              <button
                onClick={() => navigate('/samples')}
                className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                <span>View All Samples</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Sample ID</th>
                    <th className="py-2.5 px-3">Patient Name</th>
                    <th className="py-2.5 px-3">Test</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {samples.slice(0, 5).map((s) => (
                    <tr key={s._id} className="hover:bg-purple-50/40 dark:hover:bg-slate-700/30">
                      <td className="py-2.5 px-3 font-bold text-purple-700 dark:text-purple-400 font-mono">{s.sampleId}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-100">{s.patientName}</td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{s.testName}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={s.status} size="sm" />
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono">
                        {new Date(s.collectedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
            <button
              onClick={() => navigate('/samples')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md transition-all"
            >
              View All Samples
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
