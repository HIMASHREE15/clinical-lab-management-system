import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarDays, FlaskConical, Lock, Mail, MapPin, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PatientRegistrationInput } from '../types';

const initialForm: PatientRegistrationInput = {
  name: '',
  dateOfBirth: '',
  gender: 'Female',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  address: '',
  emergencyContact: '',
};

export const RegistrationPage: React.FC = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [patientId, setPatientId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const updateField = (field: keyof PatientRegistrationInput, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    const nextErrors: Record<string, string> = {};
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';
    if (form.dateOfBirth && new Date(`${form.dateOfBirth}T00:00:00`) > new Date()) {
      nextErrors.dateOfBirth = 'Date of birth cannot be in the future';
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedPatientId = await register(form);
      setPatientId(generatedPatientId);
    } catch (error: any) {
      const fieldErrors = error.response?.data?.errors as Array<{ field: string; message: string }> | undefined;
      if (fieldErrors?.length) {
        setErrors(Object.fromEntries(fieldErrors.map(({ field, message }) => [field, message])));
      }
      setErrorMessage(error.response?.data?.message || 'Registration could not be completed. Please review your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = (field: string) =>
    `w-full rounded-lg border ${errors[field] ? 'border-rose-400' : 'border-slate-200'} bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/15`;

  if (patientId) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-10 flex items-center justify-center">
        <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Patient account created</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Registration successful.</h1>
          <p className="mt-3 text-sm text-slate-600">Your Patient ID is</p>
          <p className="mt-1 font-mono text-xl font-bold text-purple-800">{patientId}</p>
          <button
            type="button"
            onClick={() => navigate('/dashboard', { replace: true })}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-lg bg-purple-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-800"
          >
            Continue to Patient Dashboard <ArrowRight className="h-4 w-4" />
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:py-12 flex items-center justify-center">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="flex flex-col justify-between bg-gradient-to-br from-purple-800 via-purple-900 to-slate-900 p-8 text-white sm:p-10">
          <Link to="/login" className="flex items-center gap-3 self-start">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <FlaskConical className="h-5 w-5 text-purple-100" />
            </span>
            <span className="text-sm font-bold">Clinical Lab Portal</span>
          </Link>
          <div className="my-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-200">Patient registration</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight">Your laboratory records, in one secure place.</h1>
            <p className="mt-4 text-sm leading-6 text-purple-100/85">
              Create your patient account before visiting the laboratory. Your care team will add test requests and samples during your visit.
            </p>
          </div>
          <p className="flex items-center gap-2 text-xs text-purple-100/80">
            <ShieldCheck className="h-4 w-4" /> Your account is private and patient-only.
          </p>
        </aside>

        <section className="p-6 sm:p-9">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Create your account</h2>
              <p className="mt-1 text-sm text-slate-500">Enter your details to receive a Patient ID.</p>
            </div>
            <Link to="/login" className="shrink-0 text-sm font-semibold text-purple-700 hover:text-purple-900">Sign in</Link>
          </div>

          {errorMessage && (
            <div role="alert" className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-x-4 gap-y-4 sm:grid-cols-2" noValidate>
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">Full Name</span>
              <span className="relative block">
                <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input autoComplete="name" className={`${fieldClass('name')} pl-9`} value={form.name} onChange={(event) => updateField('name', event.target.value)} required minLength={2} />
              </span>
              {errors.name && <span className="mt-1 block text-xs text-rose-600">{errors.name}</span>}
            </label>

            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">Date of Birth</span>
              <span className="relative block">
                <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="date" autoComplete="bday" max={new Date().toISOString().slice(0, 10)} className={`${fieldClass('dateOfBirth')} pl-9`} value={form.dateOfBirth} onChange={(event) => updateField('dateOfBirth', event.target.value)} required />
              </span>
              {errors.dateOfBirth && <span className="mt-1 block text-xs text-rose-600">{errors.dateOfBirth}</span>}
            </label>

            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">Gender</span>
              <select className={fieldClass('gender')} value={form.gender} onChange={(event) => updateField('gender', event.target.value as PatientRegistrationInput['gender'])}>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">Mobile Number</span>
              <span className="relative block">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="tel" autoComplete="tel" className={`${fieldClass('phone')} pl-9`} value={form.phone} onChange={(event) => updateField('phone', event.target.value)} required />
              </span>
              {errors.phone && <span className="mt-1 block text-xs text-rose-600">{errors.phone}</span>}
            </label>

            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">Email Address</span>
              <span className="relative block">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="email" autoComplete="email" className={`${fieldClass('email')} pl-9`} value={form.email} onChange={(event) => updateField('email', event.target.value)} required />
              </span>
              {errors.email && <span className="mt-1 block text-xs text-rose-600">{errors.email}</span>}
            </label>

            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">Password</span>
              <span className="relative block">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="password" autoComplete="new-password" className={`${fieldClass('password')} pl-9`} value={form.password} onChange={(event) => updateField('password', event.target.value)} minLength={8} required />
              </span>
              {errors.password && <span className="mt-1 block text-xs text-rose-600">{errors.password}</span>}
            </label>

            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">Confirm Password</span>
              <span className="relative block">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="password" autoComplete="new-password" className={`${fieldClass('confirmPassword')} pl-9`} value={form.confirmPassword} onChange={(event) => updateField('confirmPassword', event.target.value)} required />
              </span>
              {errors.confirmPassword && <span className="mt-1 block text-xs text-rose-600">{errors.confirmPassword}</span>}
            </label>

            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">Address <span className="font-normal text-slate-400">(optional)</span></span>
              <span className="relative block">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <textarea rows={2} autoComplete="street-address" className={`${fieldClass('address')} resize-y pl-9`} value={form.address} onChange={(event) => updateField('address', event.target.value)} />
              </span>
              {errors.address && <span className="mt-1 block text-xs text-rose-600">{errors.address}</span>}
            </label>

            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">Emergency Contact Number <span className="font-normal text-slate-400">(optional)</span></span>
              <input type="tel" autoComplete="tel-national" className={fieldClass('emergencyContact')} value={form.emergencyContact} onChange={(event) => updateField('emergencyContact', event.target.value)} />
              {errors.emergencyContact && <span className="mt-1 block text-xs text-rose-600">{errors.emergencyContact}</span>}
            </label>

            <button type="submit" disabled={isSubmitting} className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-purple-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:cursor-wait disabled:opacity-60 sm:col-span-2">
              {isSubmitting ? 'Creating account...' : 'Create Patient Account'} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </section>
      </div>
    </main>
  );
};