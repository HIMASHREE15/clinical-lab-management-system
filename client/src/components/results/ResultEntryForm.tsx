import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  UploadCloud,
  FileText,
  FileEdit,
  Trash2,
  Paperclip,
  Calendar,
  User,
  FlaskConical,
  Eye,
  Info,
} from 'lucide-react';
import { ISample, IResultParameterValue, ITestCatalog, IResult } from '../../types';
import { rangeEvaluator } from '../../utils/rangeEvaluator';
import { MedicalDisclaimerAlert } from '../common/MedicalDisclaimerAlert';
import { StatusBadge } from '../common/StatusBadge';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

interface ResultEntryFormProps {
  sample: ISample;
  testCatalog: ITestCatalog;
  existingResult?: IResult | null;
}

export const ResultEntryForm: React.FC<ResultEntryFormProps> = ({ sample, testCatalog, existingResult }) => {
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Tab mode: MANUAL or FILE_UPLOAD
  const [entryMethod, setEntryMethod] = useState<'MANUAL' | 'FILE_UPLOAD'>(
    existingResult?.entryMethod === 'FILE_UPLOAD' ? 'FILE_UPLOAD' : 'MANUAL'
  );

  // Test Date state (defaults to today's date formatted as YYYY-MM-DD or existing)
  const initialTestDate = existingResult?.testDate
    ? new Date(existingResult.testDate).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  const [testDate, setTestDate] = useState<string>(initialTestDate);

  // Initialize parameter values state for Manual Entry
  const [parameterRows, setParameterRows] = useState<IResultParameterValue[]>(() => {
    if (existingResult?.parameters && existingResult.parameters.length > 0) {
      return existingResult.parameters;
    }
    return testCatalog.parameters.map((p) => {
      let refStr = '-';
      if (p.minRef !== undefined && p.maxRef !== undefined) {
        refStr = `${p.minRef} - ${p.maxRef}`;
      } else if (p.expectedValue) {
        refStr = p.expectedValue;
      }

      return {
        parameterName: p.name,
        resultValue: '',
        unit: p.unit || '',
        referenceRange: refStr,
        flag: 'NORMAL',
        observation: '',
      };
    });
  });

  // Technician Remarks
  const [technicianRemarks, setTechnicianRemarks] = useState(
    existingResult?.technicianRemarks || 'Sample processing completed within laboratory specifications.'
  );

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<{
    dataUrl: string;
    name: string;
    type: string;
    size: number;
  } | null>(() => {
    if (existingResult?.uploadedReportFileName) {
      return {
        dataUrl: existingResult.uploadedReportUrl || '',
        name: existingResult.uploadedReportFileName,
        type: existingResult.uploadedReportFileType || 'application/pdf',
        size: existingResult.uploadedReportFileSize || 0,
      };
    }
    return null;
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitType, setSubmitType] = useState<'draft' | 'submit' | null>(null);

  // Parameter Change Handlers
  const handleValueChange = (index: number, val: string) => {
    const updated = [...parameterRows];
    const targetParamDef = testCatalog.parameters.find((tp) => tp.name === updated[index].parameterName);
    const flag = rangeEvaluator(val, targetParamDef);

    updated[index] = {
      ...updated[index],
      resultValue: val,
      flag,
    };
    setParameterRows(updated);
  };

  const handleObservationChange = (index: number, val: string) => {
    const updated = [...parameterRows];
    updated[index] = {
      ...updated[index],
      observation: val,
    };
    setParameterRows(updated);
  };

  const handleUnitChange = (index: number, val: string) => {
    const updated = [...parameterRows];
    updated[index] = {
      ...updated[index],
      unit: val,
    };
    setParameterRows(updated);
  };

  const handleRefRangeChange = (index: number, val: string) => {
    const updated = [...parameterRows];
    updated[index] = {
      ...updated[index],
      referenceRange: val,
    };
    setParameterRows(updated);
  };

  // Handle File Selection
  const processSelectedFile = (file: File) => {
    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      showToast('File Too Large', 'Maximum allowed file size is 10 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedFile({
        dataUrl: reader.result as string,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
      });
      showToast('File Selected', `${file.name} ready for submission.`, 'info');
    };
    reader.onerror = () => {
      showToast('File Read Error', 'Failed to read the selected file.', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Form Submit Handler (Draft or Full Submission)
  const handleSaveOrSubmit = async (isDraft: boolean) => {
    if (entryMethod === 'FILE_UPLOAD' && !uploadedFile) {
      showToast('Missing Report File', 'Please select or upload a report file first.', 'error');
      return;
    }

    if (entryMethod === 'MANUAL') {
      const hasAnyValue = parameterRows.some((p) => p.resultValue.trim() !== '');
      if (!isDraft && !hasAnyValue) {
        showToast('Incomplete Values', 'Please enter at least one test parameter result before submitting.', 'warning');
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitType(isDraft ? 'draft' : 'submit');

    try {
      const payload = {
        sampleId: sample.sampleId,
        entryMethod,
        parameters: parameterRows,
        technicianRemarks,
        testDate,
        isDraft,
        uploadedReportUrl: uploadedFile?.dataUrl || '',
        uploadedReportFileName: uploadedFile?.name || '',
        uploadedReportFileType: uploadedFile?.type || '',
        uploadedReportFileSize: uploadedFile?.size || 0,
      };

      await api.post('/results/save', payload);

      if (isDraft) {
        showToast(
          'Draft Saved',
          `Draft test report for sample ${sample.sampleId} saved successfully. You can return and complete it later.`,
          'success'
        );
      } else {
        showToast(
          'Report Submitted',
          `Test report for sample ${sample.sampleId} submitted successfully. It is now awaiting Doctor verification.`,
          'success'
        );
      }

      navigate(`/samples/${sample.sampleId}`);
    } catch (err: any) {
      showToast(
        'Submission Error',
        err.response?.data?.message || 'Failed to save or submit test report.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
      setSubmitType(null);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Extract Patient ID string
  const patientIdDisplay =
    typeof sample.patientId === 'string'
      ? sample.patientId
      : (sample.patientId as any)?.patientId || (sample.patientId as any)?._id || 'PAT-RECORD';

  return (
    <div className="space-y-6">
      {/* Top Comprehensive Sample & Patient Context Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                Technician Workstation
              </span>
              {existingResult?.isDraft && (
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Draft In Progress
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mt-1.5 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-purple-600" />
              Update Test Report &amp; Enter Results
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enter test readings manually or upload a completed laboratory document for verification.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={sample.status} size="sm" />
            <StatusBadge status={sample.priority} size="sm" />
          </div>
        </div>

        {/* Clear Patient, Sample & Test Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Patient Name &amp; ID</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-0.5 block truncate">
              {sample.patientName}
            </span>
            <span className="font-mono text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
              ID: {patientIdDisplay}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Sample Identifier</span>
            <span className="font-mono font-bold text-purple-700 dark:text-purple-300 text-sm mt-0.5 block">
              {sample.sampleId}
            </span>
            <span className="text-[11px] text-slate-500">Specimen: {sample.sampleType}</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Test Requested</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-0.5 block truncate">
              {sample.testName}
            </span>
            <span className="font-mono text-[11px] text-slate-500">Code: {sample.testCode}</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Test Date</span>
            <div className="relative mt-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="w-full pl-8 pr-2 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Entry Mode Switcher Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-2 shadow-soft">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setEntryMethod('MANUAL')}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              entryMethod === 'MANUAL'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
            }`}
          >
            <FileEdit className="w-4 h-4" />
            <div className="text-left">
              <span>Option 1: Manual Report Entry</span>
              <span className="block text-[10px] font-normal opacity-85">Type parameters, values &amp; observations</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setEntryMethod('FILE_UPLOAD')}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              entryMethod === 'FILE_UPLOAD'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <div className="text-left">
              <span>Option 2: Report File Upload</span>
              <span className="block text-[10px] font-normal opacity-85">Upload completed PDF or document report</span>
            </div>
          </button>
        </div>
      </div>

      {/* OPTION 1: MANUAL REPORT ENTRY FORM */}
      {entryMethod === 'MANUAL' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-purple-600" />
                Manual Parameter Findings &amp; Reference Interval Engine
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Calculates automatic biological reference interval flags for {sample.testName}
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">{parameterRows.length} Parameters</span>
          </div>

          <MedicalDisclaimerAlert />

          {/* Dynamic Parameters Entry Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Parameter Name</th>
                  <th className="py-3 px-4 w-44">Result / Reading *</th>
                  <th className="py-3 px-4 w-28">Unit</th>
                  <th className="py-3 px-4 w-36">Reference Range</th>
                  <th className="py-3 px-4 w-44">Observation / Note</th>
                  <th className="py-3 px-4">Auto Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {parameterRows.map((row, idx) => {
                  const paramDef = testCatalog.parameters.find((tp) => tp.name === row.parameterName);
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {row.parameterName}
                      </td>
                      <td className="py-3 px-4">
                        {paramDef?.choices ? (
                          <select
                            value={row.resultValue}
                            onChange={(e) => handleValueChange(idx, e.target.value)}
                            className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500/40"
                          >
                            <option value="">Select option...</option>
                            {paramDef.choices.map((choice) => (
                              <option key={choice} value={choice}>
                                {choice}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={row.resultValue}
                            onChange={(e) => handleValueChange(idx, e.target.value)}
                            placeholder="Enter value..."
                            className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500/40"
                          />
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={row.unit}
                          onChange={(e) => handleUnitChange(idx, e.target.value)}
                          placeholder="Unit"
                          className="w-full p-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-mono"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={row.referenceRange}
                          onChange={(e) => handleRefRangeChange(idx, e.target.value)}
                          placeholder="Reference range"
                          className="w-full p-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-mono"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={row.observation || ''}
                          onChange={(e) => handleObservationChange(idx, e.target.value)}
                          placeholder="Observation..."
                          className="w-full p-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                        />
                      </td>
                      <td className="py-3 px-4">
                        {row.flag === 'NORMAL' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Normal
                          </span>
                        )}
                        {(row.flag === 'ABNORMAL_HIGH' || row.flag === 'ABNORMAL_LOW') && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                            <AlertTriangle className="w-3.5 h-3.5" /> {row.flag === 'ABNORMAL_HIGH' ? 'High' : 'Low'}
                          </span>
                        )}
                        {row.flag === 'CRITICAL' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
                            <AlertTriangle className="w-3.5 h-3.5" /> Critical
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Remarks & Comments */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Technician Remarks &amp; Observations
            </label>
            <textarea
              rows={3}
              value={technicianRemarks}
              onChange={(e) => setTechnicianRemarks(e.target.value)}
              placeholder="e.g. Repeated run confirmed. Specimen verified within standard temperature."
              className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
            />
          </div>

          {/* Action Buttons: Save Draft & Submit */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 text-xs rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSaveOrSubmit(true)}
                className="px-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold transition-all flex items-center gap-2 disabled:opacity-60"
              >
                <Save className="w-4 h-4 text-slate-500" />
                <span>{isSubmitting && submitType === 'draft' ? 'Saving Draft...' : 'Save Draft'}</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSaveOrSubmit(false)}
                className="px-5 py-2.5 text-xs rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/30 transition-all flex items-center gap-2 disabled:opacity-60"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting && submitType === 'submit' ? 'Submitting...' : 'Submit Report'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OPTION 2: REPORT FILE UPLOAD FORM */}
      {entryMethod === 'FILE_UPLOAD' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-purple-600" />
                Laboratory Report Document Upload
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Upload official diagnostic PDF or scanned report document for pathologist sign-off
              </p>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,application/pdf,image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* File Upload Zone */}
          {!uploadedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                isDragging
                  ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/30'
                  : 'border-slate-300 dark:border-slate-700 hover:border-purple-500 hover:bg-slate-50 dark:hover:bg-slate-900/40'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 shadow-xs">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                Choose Laboratory Report File
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Drag and drop your report here, or click to browse files from your computer.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">PDF</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">PNG</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">JPG</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">DOCX</span>
                <span>· Max 10 MB</span>
              </div>
            </div>
          ) : (
            /* Selected File Preview Card */
            <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-xs sm:max-w-md">
                      {uploadedFile.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      Size: {formatFileSize(uploadedFile.size)} · Type: {uploadedFile.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-1"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Replace</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs transition-colors"
                    title="Remove selected file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status Notice */}
              <div className="p-3 bg-white/70 dark:bg-slate-800/70 rounded-xl text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  File attached successfully. Submitting will register this report document against Sample{' '}
                  <strong className="font-mono text-purple-600">{sample.sampleId}</strong> and Patient{' '}
                  <strong>{sample.patientName}</strong>.
                </span>
              </div>
            </div>
          )}

          {/* Technician Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Technician Remarks &amp; Report Notes
            </label>
            <textarea
              rows={3}
              value={technicianRemarks}
              onChange={(e) => setTechnicianRemarks(e.target.value)}
              placeholder="e.g. Scanned analytical report attached. All laboratory quality controls verified."
              className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
            />
          </div>

          {/* Action Buttons: Save Draft & Submit */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 text-xs rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isSubmitting || !uploadedFile}
                onClick={() => handleSaveOrSubmit(true)}
                className="px-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-slate-500" />
                <span>{isSubmitting && submitType === 'draft' ? 'Saving Draft...' : 'Save Draft'}</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting || !uploadedFile}
                onClick={() => handleSaveOrSubmit(false)}
                className="px-5 py-2.5 text-xs rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting && submitType === 'submit' ? 'Submitting...' : 'Submit Report'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
