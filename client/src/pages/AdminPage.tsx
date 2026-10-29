import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Users, Building2, TestTube2, ShieldCheck, UserPlus, Edit3, Lock, Unlock, X, History } from 'lucide-react';
import api from '../services/api';
import { IUser, IUserRoleHistory, ITestCatalog, UserRole } from '../types';
import { useNotification } from '../context/NotificationContext';

export const AdminPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = (): 'users' | 'catalog' | 'departments' => {
    if (location.pathname.includes('/departments')) return 'departments';
    if (location.pathname.includes('/catalog')) return 'catalog';
    return 'users';
  };

  const [activeTab, setActiveTab] = useState<'users' | 'catalog' | 'departments'>(getTabFromPath);
  const [users, setUsers] = useState<IUser[]>([]);
  const [tests, setTests] = useState<ITestCatalog[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  // Role Change Modal State
  const [selectedUserForRole, setSelectedUserForRole] = useState<IUser | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('Laboratory Technician');
  const [changeReason, setChangeReason] = useState('');
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [roleHistoryUser, setRoleHistoryUser] = useState<IUser | null>(null);
  const [roleHistory, setRoleHistory] = useState<IUserRoleHistory[]>([]);
  const [isLoadingRoleHistory, setIsLoadingRoleHistory] = useState(false);

  // Staff Creation Modal State
  const [isCreateStaffOpen, setIsCreateStaffOpen] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('password123');
  const [staffRole, setStaffRole] = useState<UserRole>('Laboratory Technician');
  const [staffDept, setStaffDept] = useState('Hematology');
  const [isCreatingStaff, setIsCreatingStaff] = useState(false);

  const { showToast } = useNotification();

  const fetchAdminData = async () => {
    try {
      const [usersRes, testsRes, deptRes] = await Promise.all([
        api.get('/auth/users'),
        api.get('/admin/test-catalog'),
        api.get('/admin/departments'),
      ]);
      setUsers(usersRes.data.users || []);
      setTests(testsRes.data.tests || []);
      setDepartments(deptRes.data.departments || []);
    } catch (err) {
      console.error('Failed to load admin settings:', err);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForRole) return;
    setIsChangingRole(true);
    try {
      await api.patch(`/admin/users/${selectedUserForRole._id}/role`, {
        newRole,
        reason: changeReason,
      });

      showToast(
        'Role Updated',
        `Role for ${selectedUserForRole.name} changed to '${newRole}'. Audit log generated.`,
        'success'
      );
      setSelectedUserForRole(null);
      setChangeReason('');
      fetchAdminData();
    } catch (err: any) {
      showToast('Role Update Error', err.response?.data?.message || 'Failed to update user role', 'error');
    } finally {
      setIsChangingRole(false);
    }
  };

  const handleToggleUserStatus = async (user: IUser) => {
    const targetStatus = user.isActive === false;
    try {
      await api.patch(`/admin/users/${user._id}/status`, {
        isActive: targetStatus,
        reason: targetStatus ? 'Account re-activated by Administrator' : 'Account deactivated by Administrator',
      });
      showToast(
        'User Status Updated',
        `Account for ${user.name} set to ${targetStatus ? 'Active' : 'Deactivated'}.`,
        'info'
      );
      fetchAdminData();
    } catch (err: any) {
      showToast('Status Update Error', err.response?.data?.message || 'Failed to change user status', 'error');
    }
  };

  const handleViewRoleHistory = async (user: IUser) => {
    setRoleHistoryUser(user);
    setIsLoadingRoleHistory(true);
    try {
      const response = await api.get(`/admin/users/${user._id}/role-history`);
      setRoleHistory(response.data.history || []);
    } catch (err: any) {
      showToast('Role History Error', err.response?.data?.message || 'Failed to load role history', 'error');
      setRoleHistoryUser(null);
    } finally {
      setIsLoadingRoleHistory(false);
    }
  };

  const handleCreateStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingStaff(true);
    try {
      await api.post('/admin/users', {
        name: staffName,
        email: staffEmail,
        password: staffPassword,
        role: staffRole,
        department: staffDept,
      });

      showToast('Staff Account Created', `New ${staffRole} account created for ${staffName}.`, 'success');
      setIsCreateStaffOpen(false);
      setStaffName('');
      setStaffEmail('');
      fetchAdminData();
    } catch (err: any) {
      showToast('Account Creation Error', err.response?.data?.message || 'Failed to create staff account', 'error');
    } finally {
      setIsCreatingStaff(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <main className="pt-20 px-6 pb-12">
          <Breadcrumbs items={[{ label: 'System Administration & Control' }]} />

          {/* Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveTab('users');
                  navigate('/admin/users');
                }}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === 'users'
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>User &amp; Role Policy Control</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('catalog');
                  navigate('/admin/catalog');
                }}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === 'catalog'
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <TestTube2 className="w-4 h-4" />
                <span>Test Catalog &amp; Reference Ranges</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('departments');
                  navigate('/admin/departments');
                }}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === 'departments'
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Lab Departments &amp; Equipment</span>
              </button>
            </div>

            {activeTab === 'users' && (
              <button
                onClick={() => setIsCreateStaffOpen(true)}
                className="mb-2 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-600/30 transition-all flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Create Staff Account</span>
              </button>
            )}
          </div>

          {/* Users & Role Management Tab */}
          {activeTab === 'users' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">Active System Users &amp; Roles</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Role assignment &amp; status controls restricted exclusively to Administrator
                  </p>
                </div>
              </div>

              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-purple-50/40 dark:hover:bg-slate-700/30">
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">{u.name}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{u.department || 'General'}</td>
                      <td className="py-3 px-4">
                        {u.isActive !== false ? (
                          <span className="text-emerald-600 font-semibold text-[11px]">Active</span>
                        ) : (
                          <span className="text-rose-600 font-semibold text-[11px]">Deactivated</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleViewRoleHistory(u)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-purple-100 hover:text-purple-700 font-medium text-xs transition-colors inline-flex items-center gap-1"
                          title="View role history"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>History</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUserForRole(u);
                            setNewRole(u.role);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-purple-100 hover:text-purple-700 font-medium text-xs transition-colors inline-flex items-center gap-1"
                          title="Assign New Role"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Change Role</span>
                        </button>

                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`px-2.5 py-1 rounded-lg font-medium text-xs transition-colors inline-flex items-center gap-1 ${
                            u.isActive !== false
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                          title={u.isActive !== false ? 'Deactivate User' : 'Activate User'}
                        >
                          {u.isActive !== false ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          <span>{u.isActive !== false ? 'Deactivate' : 'Activate'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Catalog Tab */}
          {activeTab === 'catalog' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-base font-bold text-slate-800 dark:text-white">Diagnostic Test Catalog</h3>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Test Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price ($)</th>
                    <th className="py-3 px-4">Turnaround (Hrs)</th>
                    <th className="py-3 px-4">Parameters Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {tests.map((t) => (
                    <tr key={t._id} className="hover:bg-purple-50/40 dark:hover:bg-slate-700/30">
                      <td className="py-3 px-4 font-bold text-purple-600 font-mono">{t.code}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">{t.name}</td>
                      <td className="py-3 px-4 text-slate-600">{t.category}</td>
                      <td className="py-3 px-4 font-mono font-bold">${t.price.toFixed(2)}</td>
                      <td className="py-3 px-4 text-slate-500">{t.turnaroundHours}h</td>
                      <td className="py-3 px-4 text-slate-500">{t.parameters.length} Parameters</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Departments Tab */}
          {activeTab === 'departments' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {departments.map((dept, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-soft">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 mb-3">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{dept.name} ({dept.code})</h4>
                    <span className="text-[10px] font-mono text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded">
                      {dept.totalTests} Tests Processed
                    </span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                    <p className="font-semibold text-slate-700 dark:text-slate-200">Active Equipment Analyzers:</p>
                    <ul className="list-disc list-inside text-slate-500 font-mono">
                      {dept.activeEquipments.map((eq: string) => (
                        <li key={eq}>{eq}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Change Role Modal */}
          {selectedUserForRole && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md w-full p-6 relative">
                <button
                  onClick={() => setSelectedUserForRole(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
                  Change Role: {selectedUserForRole.name}
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Current Assigned Role: <span className="font-semibold text-purple-600">{selectedUserForRole.role}</span>
                </p>

                <form onSubmit={handleRoleChangeSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select New Role *</label>
                    <select
                      value={newRole}
                      onChange={(e: any) => setNewRole(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                    >
                      <option value="Administrator">Administrator</option>
                      <option value="Laboratory Technician">Laboratory Technician</option>
                      <option value="Doctor">Doctor (Pathologist)</option>
                      <option value="Receptionist">Receptionist</option>
                      <option value="Patient">Patient</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Reason for Role Change (Audit Required) *
                    </label>
                    <textarea
                      rows={3}
                      value={changeReason}
                      onChange={(e) => setChangeReason(e.target.value)}
                      placeholder="e.g. Promoted to Senior Pathologist / Department Reassignment..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 resize-none"
                      required
                    />
                  </div>

                  <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setSelectedUserForRole(null)}
                      className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isChangingRole}
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/30"
                    >
                      {isChangingRole ? 'Updating...' : 'Assign Role & Audit Log'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {roleHistoryUser && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-xl w-full p-6 relative">
                <button
                  onClick={() => setRoleHistoryUser(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="Close role history"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">Role History</h3>
                <p className="text-xs text-slate-500 mt-1">{roleHistoryUser.name} · {roleHistoryUser.email}</p>
                <div className="mt-5 max-h-[60vh] overflow-y-auto">
                  {isLoadingRoleHistory ? (
                    <p className="py-8 text-center text-xs text-slate-500">Loading role history...</p>
                  ) : roleHistory.length === 0 ? (
                    <p className="py-8 text-center text-xs text-slate-500">No role changes recorded.</p>
                  ) : (
                    <ol className="divide-y divide-slate-100 dark:divide-slate-700">
                      {[...roleHistory].reverse().map((entry, index) => (
                        <li key={`${entry.timestamp}-${index}`} className="py-3 text-xs">
                          <p className="font-semibold text-slate-800 dark:text-slate-100">
                            {entry.previousRole} → {entry.newRole}
                          </p>
                          <p className="mt-1 text-slate-500">
                            By {entry.administratorName} · {new Date(entry.timestamp).toLocaleString()}
                          </p>
                          <p className="mt-1 text-slate-600 dark:text-slate-300">Reason: {entry.reason}</p>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Create Staff Modal */}
          {isCreateStaffOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md w-full p-6 relative">
                <button
                  onClick={() => setIsCreateStaffOpen(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Create Staff Account</h3>

                <form onSubmit={handleCreateStaffSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      placeholder="e.g. Dr. Jonathan Vance"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      placeholder="vance@clinicallab.com"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Initial Password *</label>
                    <input
                      type="password"
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assign Role *</label>
                      <select
                        value={staffRole}
                        onChange={(e: any) => setStaffRole(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                      >
                        <option value="Laboratory Technician">Laboratory Technician</option>
                        <option value="Doctor">Doctor (Pathologist)</option>
                        <option value="Receptionist">Receptionist</option>
                        <option value="Administrator">Administrator</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                      <input
                        type="text"
                        value={staffDept}
                        onChange={(e) => setStaffDept(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setIsCreateStaffOpen(false)}
                      className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingStaff}
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/30"
                    >
                      {isCreatingStaff ? 'Creating...' : 'Create Staff User'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
