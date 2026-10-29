import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FlaskConical,
  TestTube2,
  FileCheck2,
  Users,
  FileSpreadsheet,
  Bell,
  User,
  LogOut,
  ShieldCheck,
  Building2,
  History,
  Settings,
  Search,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user?.role || 'Patient';

  const getNavLinks = (userRole: UserRole) => {
    switch (userRole) {
      case 'Administrator':
        return [
          { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { label: 'Users & Roles', path: '/admin/users', icon: Users },
          { label: 'Patients', path: '/patients', icon: Activity },
          { label: 'Test Catalog', path: '/admin/catalog', icon: TestTube2 },
          { label: 'Laboratories', path: '/admin/departments', icon: Building2 },
          { label: 'Samples', path: '/samples', icon: FlaskConical },
          { label: 'Reports', path: '/reports', icon: FileSpreadsheet },
          { label: 'Audit Logs', path: '/audit-logs', icon: History },
          { label: 'My Profile', path: '/profile', icon: User },
        ];
      case 'Laboratory Technician':
      case 'Lab Technician':
        return [
          { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { label: 'Samples Worklist', path: '/samples', icon: FlaskConical },
          { label: 'Patients Directory', path: '/patients', icon: Users },
          { label: 'Reports', path: '/reports', icon: FileSpreadsheet },
          { label: 'Notifications', path: '/notifications', icon: Bell },
          { label: 'My Profile', path: '/profile', icon: User },
        ];
      case 'Doctor':
        return [
          { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { label: 'Verification Queue', path: '/samples?status=RESULT_GENERATED', icon: FileCheck2 },
          { label: 'All Samples', path: '/samples', icon: FlaskConical },
          { label: 'Patient Directory', path: '/patients', icon: Users },
          { label: 'Reports', path: '/reports', icon: FileSpreadsheet },
          { label: 'Notifications', path: '/notifications', icon: Bell },
          { label: 'My Profile', path: '/profile', icon: User },
        ];
      case 'Receptionist':
        return [
          { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { label: 'Sample Registration', path: '/samples?new=true', icon: FlaskConical },
          { label: 'Patients Intake', path: '/patients', icon: Users },
          { label: 'Sample Directory', path: '/samples', icon: Search },
          { label: 'Notifications', path: '/notifications', icon: Bell },
          { label: 'My Profile', path: '/profile', icon: User },
        ];
      case 'Patient':
      default:
        return [
          { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { label: 'My Reports', path: '/reports', icon: FileCheck2 },
          { label: 'Sample Tracking', path: '/samples', icon: FlaskConical },
          { label: 'Medical Profile', path: '/patients/me', icon: Activity },
          { label: 'Notifications', path: '/notifications', icon: Bell },
          { label: 'Account Profile', path: '/profile', icon: User },
        ];
    }
  };

  const links = getNavLinks(role);

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 min-h-screen flex flex-col justify-between p-4 fixed left-0 top-0 z-30 shadow-xl border-r border-slate-800">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-white">Lab System</h1>
            <p className="text-[11px] text-purple-400 font-medium">Enterprise Diagnostic Portal</p>
          </div>
        </div>

        {/* Role Badge */}
        <div className="mx-3 mb-6 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Role Mode</span>
          <span className="font-semibold text-purple-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            {role.split(' ')[0]}
          </span>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout Footer */}
      <div className="pt-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-rose-900/30 hover:text-rose-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
