import React, { useState } from 'react';
import { X, Plus, FlaskConical } from 'lucide-react';
import api from '../../services/api';
import { IPatient, ITestCatalog } from '../../types';
import { useNotification } from '../../context/NotificationContext';

interface NewSampleModalProps {
  patients: IPatient[];
  tests: ITestCatalog[];
  onClose: () => void;
  onSuccess: () => void;
}

export const NewSampleModal: React.FC<NewSampleModalProps> = ({ patients, tests, onClose, onSuccess }) => {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?._id || '');
  const [selectedTestCode, setSelectedTestCode] = useState(tests[0]?.code || '');
  const [priority, setPriority] = useState<'Normal' | 'Urgent' | 'Critical'>('Normal');
  const [sampleType, setSampleType] = useState('Whole Blood');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if ((!selectedPatientId || !patients.some((p) => p._id === selectedPatientId)) && patients.length > 0) {
      setSelectedPatientId(patients[0]._id);
    }
  }, [patients, selectedPatientId]);

  React.useEffect(() => {
    if ((!selectedTestCode || !tests.some((t) => t.code === selectedTestCode)) && tests.length > 0) {
      setSelectedTestCode(tests[0].code);
    }
  }, [tests, selectedTestCode]);

  const { showToast } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/samples', {
        patientId: selectedPatientId,
        testCode: selectedTestCode,
        priority,
        sampleType,
        notes,
      });

      showToast('Sample Registered', `Sample ${res.data.sample.sampleId} created successfully.`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('Registration Error', err.response?.data?.message || 'Failed to create sample.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-lg w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Register New Laboratory Sample</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Initiate lifecycle tracking & barcode label generation</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Patient Selector */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Patient *</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            >
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.patientId}) - {p.age} Yrs / {p.gender}
                </option>
              ))}
            </select>
          </div>

          {/* Test Catalog Selector */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Test *</label>
            <select
              value={selectedTestCode}
              onChange={(e) => setSelectedTestCode(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            >
              {tests.map((t) => (
                <option key={t._id} value={t.code}>
                  {t.name} ({t.code}) - ${t.price}
                </option>
              ))}
            </select>
          </div>

          {/* Priority & Sample Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              >
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Specimen / Sample Type</label>
              <select
                value={sampleType}
                onChange={(e) => setSampleType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              >
                <option value="Whole Blood">Whole Blood (EDTA)</option>
                <option value="Serum">Serum</option>
                <option value="Urine">Urine</option>
                <option value="Swab">Nasopharyngeal Swab</option>
                <option value="Stool">Stool Specimen</option>
              </select>
            </div>
          </div>

          {/* Clinical Notes */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Intake Remarks / Clinical Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Fasting 12 hours prior to collection..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || patients.length === 0 || tests.length === 0}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md shadow-purple-600/30 transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? 'Registering...' : 'Register Sample'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
