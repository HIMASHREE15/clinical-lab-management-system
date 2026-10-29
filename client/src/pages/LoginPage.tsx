import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FlaskConical, ShieldCheck, Eye, EyeOff, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await login(identifier.trim(), password);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid credentials or account deactivated.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4 selection:bg-purple-500 selection:text-white">
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden max-w-4xl w-full grid grid-cols-1 md:grid-cols-2">
        {/* Left Side Graphic Banner */}
        <div className="bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 text-white p-8 sm:p-10 flex flex-col justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <FlaskConical className="w-6 h-6 text-purple-200" />
            </div>
            <span className="font-bold text-sm tracking-wide">Clinical Lab Portal</span>
          </div>

          <div className="my-8 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Clinical Lab <br />
              <span className="text-purple-300">Sample Tracking &amp; Result Management</span>
            </h2>
            <p className="text-xs text-purple-200 leading-relaxed">
              Enterprise-grade diagnostic management platform with 10-stage lifecycle tracking, chain-of-custody auditing, and authenticated report delivery.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[11px] text-purple-200 font-mono">
              <ShieldCheck className="w-4 h-4 text-purple-300" />
              <span>ISO 15189 Compliant Security</span>
            </div>
          </div>
        </div>

        {/* Right Side Login Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="text-center mb-6">
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">Welcome Back!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sign in to access your laboratory portal</p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* Identifier Input */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email, Username, or Patient ID
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Enter registered email, username, or Patient ID"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all mt-2 disabled:opacity-60"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-5">
              New patient?{' '}
              <Link to="/register" className="font-bold text-purple-700 hover:text-purple-800 dark:text-purple-300">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
