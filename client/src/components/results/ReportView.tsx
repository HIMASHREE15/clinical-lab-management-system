import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Download, CheckCircle2, ShieldCheck, ArrowLeft, FlaskConical, FileText, ExternalLink, FileCheck } from 'lucide-react';
import { ISample, IResult, IPatient } from '../../types';
import { MEDICAL_DISCLAIMER } from '../../config/constants';
import { MedicalDisclaimerAlert } from '../common/MedicalDisclaimerAlert';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface ReportViewProps {
  sample: ISample;
  result: IResult;
  patient: IPatient;
}

export const ReportView: React.FC<ReportViewProps> = ({ sample, result, patient }) => {
  const navigate = useNavigate();

  const handleDownloadPDF = async () => {
    try {
      const response = await api.get(`/results/pdf/${sample.sampleId}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `LabReport_${sample.sampleId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      const token = localStorage.getItem('lab_auth_token');
      window.open(`/api/results/pdf/${sample.sampleId}?token=${token}`, '_blank');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const hasParametersWithValues = result.parameters && result.parameters.some(p => p.resultValue && p.resultValue.trim() !== '');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Official PDF</span>
          </button>
        </div>
      </div>

      {/* Official Report Card (Matches Mockup #7) */}
      <div className="bg-white text-slate-800 rounded-2xl border border-slate-300 p-8 shadow-xl print:shadow-none print:border-none print:p-0 font-sans">
        {/* Lab Branding Header */}
        <div className="flex items-start justify-between border-b-2 border-purple-600 pb-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg">
              <FlaskConical className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">City Clinical Laboratory</h1>
              <p className="text-xs text-slate-600 mt-0.5">
                123, Health Care Street, Medical Zone, Coimbatore - 641001
              </p>
              <p className="text-[11px] text-slate-500 font-mono">Ph: 0422-1234567 | ISO 15189 Accredited Diagnostic Lab</p>
            </div>
          </div>

          <div className="text-right text-xs space-y-1 font-mono">
            <div className="bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200">
              <span className="text-slate-500 block text-[10px]">Report ID:</span>
              <span className="font-bold text-purple-700 text-sm">RPT-{sample.sampleId}</span>
            </div>
            <p className="text-[10px] text-slate-500 pt-1">
              Reported On: {new Date(result.releasedAt || result.createdAt).toLocaleString()}
            </p>
            {result.entryMethod && (
              <span className="inline-block px-2 py-0.5 text-[9px] font-bold rounded bg-slate-100 text-slate-600 uppercase tracking-wider">
                Method: {result.entryMethod === 'FILE_UPLOAD' ? 'Report Upload' : 'Manual Entry'}
              </span>
            )}
          </div>
        </div>

        {/* Patient & Sample Metadata Grid */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-6">
          <div className="space-y-1.5">
            <div className="flex"><span className="w-28 font-semibold text-slate-500">Patient Name:</span> <span className="font-bold text-slate-900">{patient.name}</span></div>
            <div className="flex"><span className="w-28 font-semibold text-slate-500">Patient ID:</span> <span className="font-mono text-slate-800">{patient.patientId}</span></div>
            <div className="flex"><span className="w-28 font-semibold text-slate-500">Age / Gender:</span> <span className="text-slate-800">{patient.age} / {patient.gender}</span></div>
          </div>
          <div className="space-y-1.5 border-l border-slate-200 pl-4">
            <div className="flex"><span className="w-28 font-semibold text-slate-500">Sample ID:</span> <span className="font-mono font-bold text-purple-700">{sample.sampleId}</span></div>
            <div className="flex"><span className="w-28 font-semibold text-slate-500">Test Name:</span> <span className="font-semibold text-slate-900">{sample.testName}</span></div>
            <div className="flex"><span className="w-28 font-semibold text-slate-500">Collected On:</span> <span className="text-slate-800">{new Date(sample.collectedAt).toLocaleString()}</span></div>
            {result.testDate && (
              <div className="flex"><span className="w-28 font-semibold text-slate-500">Test Date:</span> <span className="text-slate-800">{new Date(result.testDate).toLocaleDateString()}</span></div>
            )}
          </div>
        </div>

        {/* Uploaded Document Display (if uploaded by technician) */}
        {result.uploadedReportUrl && (
          <div className="mb-6 p-4 rounded-xl border border-purple-200 bg-purple-50/40">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-3 border-b border-purple-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-sm">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>Attached Official Report Document</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                      Uploaded File
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {result.uploadedReportFileName || 'Laboratory_Report_Document.pdf'}
                    {result.uploadedReportFileSize ? ` (${(result.uploadedReportFileSize / 1024).toFixed(1)} KB)` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={result.uploadedReportUrl}
                  download={result.uploadedReportFileName || `LabReport_${sample.sampleId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-purple-200 hover:bg-purple-100 text-purple-700 text-xs font-semibold shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </a>
                <a
                  href={result.uploadedReportUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Document</span>
                </a>
              </div>
            </div>

            {/* Document Preview */}
            {result.uploadedReportFileType?.startsWith('image/') || result.uploadedReportUrl.startsWith('data:image/') ? (
              <div className="mt-3 rounded-lg overflow-hidden border border-purple-100 bg-white p-2">
                <img
                  src={result.uploadedReportUrl}
                  alt={result.uploadedReportFileName || 'Uploaded lab report'}
                  className="max-h-96 w-auto mx-auto object-contain rounded"
                />
              </div>
            ) : result.uploadedReportFileType === 'application/pdf' || result.uploadedReportUrl.startsWith('data:application/pdf') ? (
              <div className="mt-3 rounded-lg overflow-hidden border border-purple-100 bg-white">
                <iframe
                  src={result.uploadedReportUrl}
                  title={result.uploadedReportFileName || 'PDF Preview'}
                  className="w-full h-96 border-none"
                />
              </div>
            ) : null}
          </div>
        )}

        {/* Parameter Results Table */}
        {(hasParametersWithValues || (!result.uploadedReportUrl && result.parameters.length > 0)) && (
          <div className="mb-6 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Parameter</th>
                  <th className="py-2.5 px-4">Result</th>
                  <th className="py-2.5 px-4">Unit</th>
                  <th className="py-2.5 px-4">Reference Range</th>
                  <th className="py-2.5 px-4">Status Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {result.parameters.map((param, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{param.parameterName}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900 font-mono">{param.resultValue || '-'}</td>
                    <td className="py-2.5 px-4 text-slate-600 font-mono">{param.unit || '-'}</td>
                    <td className="py-2.5 px-4 text-slate-600 font-mono">{param.referenceRange || '-'}</td>
                    <td className="py-2.5 px-4">
                      {param.flag === 'NORMAL' ? (
                        <span className="text-emerald-700 font-semibold">Normal</span>
                      ) : param.flag === 'CRITICAL' ? (
                        <span className="text-rose-700 font-bold uppercase">Critical</span>
                      ) : (
                        <span className="text-amber-700 font-bold">Abnormal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Technician Remarks */}
        {result.technicianRemarks && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-6">
            <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-purple-600" />
              Technician Remarks / Observations
            </h4>
            <p className="text-slate-700 leading-relaxed">{result.technicianRemarks}</p>
          </div>
        )}

        {/* Clinical Observations Section */}
        {result.clinicalInsights && result.clinicalInsights.length > 0 && (
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs mb-6">
            <h4 className="font-bold text-purple-900 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-700" />
              Clinical Insights & Observations
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              {result.clinicalInsights.map((insight, idx) => (
                <li key={idx}>{insight}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Pathologist & Tech Signatures + QR Code */}
        <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs">
              <QRCodeSVG value={`${window.location.origin}/verify-report/${sample.sampleId}`} size={75} />
            </div>
            <div className="space-y-0.5 text-[11px] text-slate-500 font-mono">
              <p className="font-bold text-slate-800">Scan to Verify Report</p>
              <p>Digital Cert Hash: #8849-EF21</p>
              <p>Status: {result.isVerifiedByDoctor ? 'Authenticated & Released' : 'Pending Doctor Verification'}</p>
            </div>
          </div>

          <div className="text-right space-y-1">
            <div className="w-44 border-b border-slate-400 mb-1"></div>
            <p className="font-bold text-slate-900">{result.verifiedByDoctorName || 'Dr. Karthik MD'}</p>
            <p className="text-slate-500 text-[11px]">Consulting Pathologist</p>
            <p className={`font-semibold text-[10px] flex items-center justify-end gap-1 ${result.isVerifiedByDoctor ? 'text-emerald-600' : 'text-amber-600'}`}>
              <CheckCircle2 className="w-3 h-3" /> {result.isVerifiedByDoctor ? 'Digitally Verified' : 'Awaiting Final Verification'}
            </p>
          </div>
        </div>

        {/* Medical Disclaimer */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-400 text-center italic">
          {MEDICAL_DISCLAIMER}
        </div>
      </div>
    </div>
  );
};
