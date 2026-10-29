import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer } from 'lucide-react';
import { ISample } from '../../types';

interface SampleQRModalProps {
  sample: ISample | null;
  onClose: () => void;
}

export const SampleQRModal: React.FC<SampleQRModalProps> = ({ sample, onClose }) => {
  if (!sample) return null;

  const verificationUrl = `${window.location.origin}/verify-report/${sample.sampleId}`;

  const handlePrintLabel = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-sm w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800">
            Sample Verification Code
          </span>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-2 font-mono">{sample.sampleId}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{sample.patientName} | {sample.testName}</p>
        </div>

        {/* Dynamic Scanable QR Code Container */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-inner flex flex-col items-center justify-center mx-auto w-48 h-48 mb-4">
          <QRCodeSVG
            value={verificationUrl}
            size={160}
            level="H"
            includeMargin
          />
        </div>

        {/* Barcode Simulated Visual */}
        <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center mb-6 font-mono tracking-widest text-slate-700 dark:text-slate-300">
          <div className="text-lg font-bold">||||| ||| |||| ||||</div>
          <span className="text-[10px] text-slate-400 block mt-1">*{sample.sampleId}*</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintLabel}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs shadow-md shadow-purple-600/30 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Label</span>
          </button>
        </div>
      </div>
    </div>
  );
};
