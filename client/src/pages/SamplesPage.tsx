import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SampleTable } from '../components/samples/SampleTable';
import { SampleQRModal } from '../components/samples/SampleQRModal';
import { NewSampleModal } from '../components/samples/NewSampleModal';
import api from '../services/api';
import { ISample, IPatient, ITestCatalog } from '../types';
import { useAuth } from '../context/AuthContext';

export const SamplesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [samples, setSamples] = useState<ISample[]>([]);
  const [patients, setPatients] = useState<IPatient[]>([]);
  const [tests, setTests] = useState<ITestCatalog[]>([]);
  const [selectedQR, setSelectedQR] = useState<ISample | null>(null);
  const [isNewSampleOpen, setIsNewSampleOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (searchParams.get('new') === 'true' && (user?.role === 'Administrator' || user?.role === 'Receptionist')) {
      setIsNewSampleOpen(true);
    }
  }, [searchParams, user?.role]);

  const fetchSamplesData = async () => {
    try {
      const samplesRes = await api.get('/samples');
      setSamples(samplesRes.data.samples || []);
      if (user?.role !== 'Patient') {
        const [patientsRes, testsRes] = await Promise.all([
          api.get('/patients'),
          api.get('/admin/test-catalog'),
        ]);
        setPatients(patientsRes.data.patients || []);
        setTests(testsRes.data.tests || []);
      }
    } catch (err) {
      console.error('Failed to load samples:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSamplesData();
  }, [user?.role]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <main className="pt-20 px-6 pb-12">
          <Breadcrumbs items={[{ label: 'Sample Management' }]} />

          <SampleTable
            samples={samples}
            onNewSampleClick={user?.role === 'Administrator' || user?.role === 'Receptionist' ? () => setIsNewSampleOpen(true) : undefined}
            onQRClick={(sample) => setSelectedQR(sample)}
          />

          {/* QR Modal */}
          {selectedQR && <SampleQRModal sample={selectedQR} onClose={() => setSelectedQR(null)} />}

          {/* New Sample Modal */}
          {isNewSampleOpen && (
            <NewSampleModal
              patients={patients}
              tests={tests}
              onClose={() => setIsNewSampleOpen(false)}
              onSuccess={fetchSamplesData}
            />
          )}
        </main>
      </div>
    </div>
  );
};
