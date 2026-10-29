import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, XCircle, CheckCircle2, FlaskConical, ArrowLeft, Building2, Calendar, FileText } from 'lucide-react';
import axios from 'axios';

export const PublicReportVerificationPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [verificationData, setVerificationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        const res = await axios.get(`/api/public/verify-report/${reportId}`);
        setVerificationData(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Verification lookup failed.');
      } finally {
        setLoading(false);
      }
    };
    fetchVerification();
  }, [reportId]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-purple-500 selection:text-white">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Report Verification Registry</h2>
              <p className="text-[10px] text-purple-400 font-mono">ISO 15189 Authenticated Portal</p>
            </div>
          </div>

          <Link to="/" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
            Querying central laboratory cryptographic ledger...
          </div>
        ) : error || !verificationData?.verified ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <XCircle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">Unverified / Invalid Report</h3>
            <p className="text-xs text-slate-400 leading-relaxed px-4">
              {error || 'This report ID is either unreleased, tampered with, or not registered in our central system.'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Authenticated Banner */}
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Official Verified Laboratory Report</h4>
                <p className="text-[11px] opacity-90">Authentic record issued by City Clinical Laboratory.</p>
              </div>
            </div>

            {/* Details Box */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400">Report ID:</span>
                <span className="font-mono font-bold text-purple-400 text-sm">
                  {verificationData.reportDetails.reportId}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Sample ID:</span>
                <span className="font-mono font-semibold text-slate-200">
                  {verificationData.reportDetails.sampleId}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Test Performed:</span>
                <span className="font-semibold text-white">
                  {verificationData.reportDetails.testName}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Patient Initials:</span>
                <span className="font-mono text-slate-300">
                  {verificationData.reportDetails.patientInitials}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Verified By Pathologist:</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {verificationData.reportDetails.verifiedByPathologist}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-slate-400">Released On:</span>
                <span className="font-mono text-[11px] text-slate-300">
                  {new Date(verificationData.reportDetails.releasedAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 text-center italic">
              Cryptographic Hash: #8849-EF21-9940 | Patient Privacy PII Redacted
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
