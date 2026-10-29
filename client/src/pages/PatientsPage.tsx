import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Users, Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NewPatientModal } from '../components/patients/NewPatientModal';
import api from '../services/api';
import { IPatient } from '../types';

export const PatientsPage: React.FC = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<IPatient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data.patients || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contact.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <main className="pt-20 px-6 pb-12">
          <Breadcrumbs items={[{ label: 'Patients Directory' }]} />

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-white">Registered Patients Directory</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Electronic health record Index &amp; demographics</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Patient Name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40 w-56"
                  />
                </div>

                {(user?.role === 'Administrator' || user?.role === 'Receptionist') && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs shadow-md shadow-purple-600/30 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Register Patient</span>
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Patient ID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Age / Gender</th>
                    <th className="py-3 px-4">Contact Phone</th>
                    <th className="py-3 px-4">Blood Group</th>
                    <th className="py-3 px-4">Medical History</th>
                    <th className="py-3 px-4 text-right">Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {filteredPatients.map((patient) => (
                    <tr key={patient._id} className="hover:bg-purple-50/40 dark:hover:bg-slate-700/30">
                      <td className="py-3 px-4 font-bold font-mono">
                        <Link to={`/patients/${patient.patientId}`} className="text-purple-700 hover:underline dark:text-purple-400">{patient.patientId}</Link>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">{patient.name}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{patient.age} / {patient.gender}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">{patient.contact}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{patient.bloodGroup || 'O+'}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {patient.medicalHistory?.join(', ') || 'No recorded chronic conditions'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link to={`/patients/${patient.patientId}`} className="font-semibold text-purple-700 hover:underline dark:text-purple-300">Open</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* New Patient Modal */}
          {isModalOpen && (
            <NewPatientModal
              onClose={() => setIsModalOpen(false)}
              onSuccess={fetchPatients}
            />
          )}
        </main>
      </div>
    </div>
  );
};
