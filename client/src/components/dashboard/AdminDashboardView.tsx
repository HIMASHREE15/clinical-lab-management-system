import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, FlaskConical, FileText, TrendingUp, Activity } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { IDashboardAnalytics } from '../../types';

interface AdminDashboardProps {
  analytics: IDashboardAnalytics;
}

export const AdminDashboardView: React.FC<AdminDashboardProps> = ({ analytics }) => {
  const navigate = useNavigate();

  const stats = [
    { title: 'Total Users', value: String(analytics.summary?.totalUsers || 45), icon: Users, color: 'from-purple-500 to-indigo-600', text: 'text-purple-600', path: '/admin/users' },
    { title: 'Total Patients', value: String(analytics.summary?.totalPatients || 320), icon: UserCheck, color: 'from-emerald-500 to-teal-600', text: 'text-emerald-600', path: '/patients' },
    { title: 'Total Samples', value: String(analytics.summary?.totalSamples || 128), icon: FlaskConical, color: 'from-blue-500 to-cyan-600', text: 'text-blue-600', path: '/samples' },
    { title: 'Total Reports', value: String(analytics.summary?.totalReports || 98), icon: FileText, color: 'from-amber-500 to-orange-600', text: 'text-amber-600', path: '/reports' },
  ];

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Cards (Matches Mockup #8) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-soft flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{stat.title}</p>
                <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1 tracking-tight">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${stat.color} text-white flex items-center justify-center shadow-md`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Samples Overview Chart & Recent Activities (Matches Mockup #8) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Line/Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Samples Overview (This Month)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Throughput breakdown by lifecycle status</p>
            </div>
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
              Live Data
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.monthlySampleGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="collected" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCollected)" name="Collected" />
                <Area type="monotone" dataKey="completed" stroke="#10b981" fillOpacity={1} fill="url(#colorCompleted)" name="Completed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities Timeline (Matches Mockup #8) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Recent System Activities</h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">New sample SMP1010 added</p>
                  <p className="text-[10px] text-slate-400">Receptionist Intake</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">26 May 2025</span>
              </div>

              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <div>
                  <p className="font-semibold text-purple-600 dark:text-purple-400">Result published for SMP1002</p>
                  <p className="text-[10px] text-slate-400">Nurse Revathi</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">20 May 2025</span>
              </div>

              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">New patient registered: Priya S</p>
                  <p className="text-[10px] text-slate-400">Front Desk</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">19 May 2025</span>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">User Dr. Karthik added</p>
                  <p className="text-[10px] text-slate-400">Pathology Admin</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">18 May 2025</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 text-center">
            <button
              onClick={() => navigate('/audit-logs')}
              className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold cursor-pointer hover:underline"
            >
              View All Audit Logs →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
