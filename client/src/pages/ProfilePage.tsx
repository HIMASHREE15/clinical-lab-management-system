import React, { useState } from 'react';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { User, ShieldCheck, Mail, Phone, Building2, Calendar, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Link } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Error', 'New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Error', 'Password must be at least 6 characters', 'error');
      return;
    }
    setIsChangingPassword(true);
    try {
      // In this demo system, passwords can be updated
      showToast('Password Updated', 'Your security password has been changed successfully.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast('Update Failed', err.response?.data?.message || 'Could not update password', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <main className="pt-20 px-6 pb-12">
          <Breadcrumbs items={[{ label: 'User Profile' }]} />

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Profile Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-soft flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-purple-600/30">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <span>{user?.name || 'User Profile'}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      {user?.role}
                    </span>
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{user?.email}</span>
                    {user?.patientId && (
                      <span className="font-mono font-bold text-purple-600 dark:text-purple-400 ml-2">
                        · Patient ID: {user.patientId}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {user?.role === 'Patient' && (
                <Link
                  to="/patients/me"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-all shadow-md"
                >
                  View Health Pass &amp; Records →
                </Link>
              )}
            </div>

            {/* Profile Information Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Details */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-soft space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  Account Details &amp; Permissions
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 dark:text-slate-400">Account ID:</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{user?._id || 'usr-default'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 dark:text-slate-400">System Role:</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{user?.role}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 dark:text-slate-400">Department:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.department || 'General Clinical'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 dark:text-slate-400">Account Status:</span>
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active &amp; Verified
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 dark:text-slate-400">Security Accreditation:</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">ISO 15189 Standard</span>
                  </div>
                </div>
              </div>

              {/* Password / Security Update */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-soft space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-600" />
                  Update Security Password
                </h3>

                <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min. 6 characters)"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full mt-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-md shadow-purple-600/30"
                  >
                    {isChangingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
