import React from 'react';
import { CheckCircle2, Clock, MapPin, User, AlertCircle } from 'lucide-react';
import { ISample, WorkflowStageId } from '../../types';
import { WORKFLOW_STAGES } from '../../config/constants';

interface SampleTimelineProps {
  sample: ISample;
  onAdvanceStatusClick?: () => void;
}

export const SampleTimeline: React.FC<SampleTimelineProps> = ({ sample, onAdvanceStatusClick }) => {
  // Map timeline steps by status ID
  const timelineMap = new Map(sample.timeline.map((step) => [step.status, step]));

  // Find index of current status
  const currentStageIndex = WORKFLOW_STAGES.findIndex((s: { id: string }) => s.id === sample.status);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Sample Life-Cycle Timeline</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Step-by-step audit trail & chain of custody</p>
        </div>

        {onAdvanceStatusClick && currentStageIndex < WORKFLOW_STAGES.length - 1 && (
          <button
            onClick={onAdvanceStatusClick}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all"
          >
            Advance to Next Stage
          </button>
        )}
      </div>

      <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700 space-y-6">
        {WORKFLOW_STAGES.map((stage: { id: WorkflowStageId; label: string; step: number }, idx: number) => {
          const stepData = timelineMap.get(stage.id);
          const isCompleted = idx <= currentStageIndex;
          const isCurrent = idx === currentStageIndex;

          return (
            <div key={stage.id} className="relative group">
              {/* Timeline Dot Indicator */}
              <div
                className={`absolute -left-[31px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCompleted
                    ? 'bg-purple-600 text-white ring-4 ring-purple-100 dark:ring-purple-950/60 shadow-md'
                    : isCurrent
                    ? 'bg-amber-500 text-white ring-4 ring-amber-100 dark:ring-amber-950/60 animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400 border border-slate-300 dark:border-slate-600'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : stage.step}
              </div>

              {/* Stage Info Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4
                  className={`text-sm font-semibold ${
                    isCurrent
                      ? 'text-purple-600 dark:text-purple-400'
                      : isCompleted
                      ? 'text-slate-800 dark:text-slate-200'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {stage.label}
                  {isCurrent && (
                    <span className="ml-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                      Active Stage
                    </span>
                  )}
                </h4>

                {stepData && (
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {new Date(stepData.timestamp).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Step Detail metadata if recorded */}
              {stepData ? (
                <div className="mt-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                  <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1 font-medium">
                      <User className="w-3.5 h-3.5 text-purple-500" />
                      Staff: {stepData.updatedBy}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      Location: {stepData.location}
                    </span>
                  </div>
                  {stepData.remarks && (
                    <p className="text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-200/60 dark:border-slate-800">
                      "{stepData.remarks}"
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">Pending completion</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
