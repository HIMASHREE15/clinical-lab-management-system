import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  ShieldCheck,
  Award,
  Clock,
  QrCode,
  FileCheck2,
  Users,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { WORKFLOW_STAGES } from '../../config/constants';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the 10-step sample tracking timeline work?',
      a: 'Every laboratory sample is assigned a unique Sample ID, QR Code, and Barcode at intake. Each physical transition (from Collection to Analysis to Pathologist Verification) automatically updates the timeline with exact timestamps, staff credentials, and bench locations.',
    },
    {
      q: 'Are the clinical observations medical diagnoses?',
      a: 'No. The intelligent decision support module evaluates numerical parameters against reference intervals and provides informational flags only (e.g. "Result above reference range"). A licensed physician must interpret all findings in clinical context.',
    },
    {
      q: 'How can patients verify their official lab report authenticity?',
      a: 'Every PDF report includes an embedded cryptographic QR code. Scanning the QR code links directly to our tamper-evident verification server.',
    },
    {
      q: 'What role permissions are supported?',
      a: 'The system supports Administrator, Laboratory Technician, Doctor (Consulting Pathologist), Receptionist, and Patient roles, each with custom dashboards and strict data scoping.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans selection:bg-purple-500 selection:text-white">
      {/* Landing Navbar */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">City Clinical Lab</h1>
            <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wider">
              Diagnostic Management System
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <a href="#about" className="hover:text-purple-600 transition-colors">About Us</a>
          <a href="#services" className="hover:text-purple-600 transition-colors">Services</a>
          <a href="#workflow" className="hover:text-purple-600 transition-colors">10-Step Workflow</a>
          <a href="#why-us" className="hover:text-purple-600 transition-colors">Why Choose Us</a>
          <a href="#faq" className="hover:text-purple-600 transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-purple-600 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all flex items-center gap-2"
          >
            <span>Launch Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-4 h-4 text-purple-600" /> Enterprise Diagnostic Laboratory Software
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Precision Sample Tracking & <span className="text-purple-600">Secure Result Delivery</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            Eliminate sample misidentification, streamline turnaround times, and deliver verified electronic health reports with full chain-of-custody audit logs and QR code authentication.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all flex items-center gap-2"
            >
              <span>Explore Demo Perspective</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#workflow"
              className="px-6 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition-all"
            >
              View 10-Step Workflow
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-4 text-center">
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">99.9%</h3>
              <p className="text-xs text-slate-500 mt-0.5">Tracking Accuracy</p>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-purple-600">10-Step</h3>
              <p className="text-xs text-slate-500 mt-0.5">Chain of Custody</p>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">&lt; 45 Min</h3>
              <p className="text-xs text-slate-500 mt-0.5">Avg Turnaround Time</p>
            </div>
          </div>
        </div>

        {/* Hero Interactive Card Preview */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold text-xs">
                SMP
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Sample SMP1002 - Urine Test</h4>
                <p className="text-[10px] text-slate-400 font-mono">Patient: Anitha R (PT1002)</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
              DELIVERED
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Collected On:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">20 May 2025, 09:30 AM</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Pathologist Verification:</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Dr. Karthik MD
              </span>
            </div>
          </div>

          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800/60 text-xs">
            <p className="font-semibold text-purple-900 dark:text-purple-200">Informational Finding:</p>
            <p className="text-[11px] text-purple-700 dark:text-purple-300 mt-0.5">
              Trace protein observed; recommend hydration and routine physician follow-up.
            </p>
          </div>
        </div>
      </section>

      {/* About Laboratory Section */}
      <section id="about" className="py-20 bg-white dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-800 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">About Our Facility</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              Advanced Clinical Diagnostics Built for Patient Safety
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm mt-4 leading-relaxed">
              City Clinical Laboratory is an ISO 15189 accredited diagnostic institution dedicated to delivering accurate, timely, and secure pathology results. Our laboratory system integrates state-of-the-art automated analyzers with rigid digital verification workflows.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <Award className="w-6 h-6 text-purple-600 mb-2" />
              ISO 15189 Accredited
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <QrCode className="w-6 h-6 text-blue-600 mb-2" />
              Cryptographic QR Verification
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <Clock className="w-6 h-6 text-emerald-600 mb-2" />
              Real-time Lifecycle Auditing
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <ShieldCheck className="w-6 h-6 text-amber-600 mb-2" />
              Pathologist Digital Signatures
            </div>
          </div>
        </div>
      </section>

      {/* 10-Step Interactive Workflow */}
      <section id="workflow" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Traceability Lifecycle</span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            The 10-Step End-to-End Sample Journey
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-2">
            Every specimen moves through strict quality checkpoints before report release
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {WORKFLOW_STAGES.map((st: { id: string; label: string; step: number }) => (
            <div
              key={st.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-soft hover:border-purple-500 transition-all group"
            >
              <span className="w-7 h-7 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 font-extrabold text-xs flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition-all">
                {st.step}
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{st.label}</h4>
              <p className="text-[11px] text-slate-500 mt-1">Audit log & staff timestamp recorded</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500 mt-1">Everything you need to know about our sample tracking platform</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full text-left p-5 text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openFaqIndex === idx ? 'rotate-180 text-purple-600' : ''}`} />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/50 dark:border-slate-700/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
              <FlaskConical className="w-5 h-5" />
            </div>
            <span className="text-white font-bold text-sm">City Clinical Laboratory</span>
          </div>
          <p>© 2026 Clinical Laboratory Management System. Built for Enterprise Reliability.</p>
        </div>
      </footer>
    </div>
  );
};
