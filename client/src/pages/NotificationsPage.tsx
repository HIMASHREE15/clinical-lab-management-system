import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Bell, CheckCircle2, AlertTriangle, FileText, Download, Info } from 'lucide-react';
import api from '../services/api';
import { INotification } from '../types';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <main className="pt-20 px-6 pb-12">
          <Breadcrumbs items={[{ label: 'Notifications & Alerts' }]} />

          {/* Notifications Container (Matches Mockup #9) */}
          <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800 dark:text-white">Notifications &amp; Alert Center</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Automated event triggers across SMS, Email & In-App</p>
                </div>
              </div>

              <span className="text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200">
                {notifications.filter((n) => !n.isRead).length} Unread
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No notifications at present.</div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                      notif.isRead ? 'bg-white dark:bg-slate-800' : 'bg-purple-50/40 dark:bg-purple-950/20'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {notif.type === 'SUCCESS' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                        {notif.type === 'CRITICAL' && <AlertTriangle className="w-5 h-5 text-rose-500" />}
                        {notif.type === 'WARNING' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                        {notif.type === 'INFO' && <Info className="w-5 h-5 text-blue-500" />}
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                          <span>{notif.title}</span>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!notif.isRead && (
                        <button
                          onClick={() => markRead(notif._id)}
                          className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline mt-2"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
