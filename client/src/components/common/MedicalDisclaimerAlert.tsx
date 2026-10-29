import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

interface MedicalDisclaimerAlertProps {
  compact?: boolean;
}

export const MedicalDisclaimerAlert: React.FC<MedicalDisclaimerAlertProps> = ({ compact = false }) => {
  return (
    <div className={`rounded-xl border border-amber-200 bg-amber-50/90 dark:bg-amber-950/40 dark:border-amber-800/60 p-3.5 text-amber-900 dark:text-amber-200 shadow-xs`}>
      <div className="flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs leading-relaxed">
          <p className="font-semibold flex items-center gap-1 text-amber-900 dark:text-amber-100">
            <span>INFORMATIONAL CLINICAL OBSERVATION NOTICE</span>
          </p>
          <p className="opacity-90">
            Calculated reference flags and automated observations are provided for general informational support only. They do <strong>NOT</strong> constitute a definitive medical diagnosis. All laboratory findings must be reviewed and interpreted by a licensed medical professional in clinical context.
          </p>
        </div>
      </div>
    </div>
  );
};
