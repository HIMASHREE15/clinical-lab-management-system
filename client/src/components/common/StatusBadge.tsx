import React from 'react';
import { WorkflowStageId } from '../../types';

interface StatusBadgeProps {
  status: WorkflowStageId | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyle = () => {
    switch (status) {
      case 'REGISTERED':
        return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      case 'COLLECTED':
        return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800';
      case 'RECEIVED_IN_LAB':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
      case 'ASSIGNED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800';
      case 'UNDER_ANALYSIS':
      case 'Under Testing':
      case 'In Progress':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      case 'QUALITY_CHECK':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
      case 'RESULT_GENERATED':
      case 'Pending Result':
        return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800';
      case 'DOCTOR_VERIFIED':
        return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800';
      case 'RELEASED':
      case 'DELIVERED':
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      case 'Urgent':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-200 dark:border-amber-700';
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/50 dark:text-rose-200 dark:border-rose-700';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'REGISTERED': return 'Registered';
      case 'COLLECTED': return 'Collected';
      case 'RECEIVED_IN_LAB': return 'Received in Lab';
      case 'ASSIGNED': return 'Assigned';
      case 'UNDER_ANALYSIS': return 'Under Testing';
      case 'QUALITY_CHECK': return 'Quality Check';
      case 'RESULT_GENERATED': return 'Result Generated';
      case 'DOCTOR_VERIFIED': return 'Doctor Verified';
      case 'RELEASED': return 'Released';
      case 'DELIVERED': return 'Completed';
      default: return status;
    }
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3.5 py-1 text-sm font-semibold' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClass} ${getStyle()} transition-all shadow-xs`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 animate-pulse" />
      {getLabel()}
    </span>
  );
};
