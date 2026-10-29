import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ResultEntryForm } from '../components/results/ResultEntryForm';
import api from '../services/api';
import { ISample, ITestCatalog, IResult } from '../types';

export const ResultEntryPage: React.FC = () => {
  const { sampleId } = useParams<{ sampleId: string }>();
  const [sample, setSample] = useState<ISample | null>(null);
  const [testCatalog, setTestCatalog] = useState<ITestCatalog | null>(null);
  const [existingResult, setExistingResult] = useState<IResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const targetId = sampleId || 'SMP1002';
        const sampleRes = await api.get(`/samples/${targetId}`);
        const currentSample: ISample = sampleRes.data.sample;
        setSample(currentSample);
        setExistingResult(sampleRes.data.result || null);

        const testsRes = await api.get('/admin/test-catalog');
        const tests: ITestCatalog[] = testsRes.data.tests;
        const matchingTest = tests.find((t) => t.code === currentSample.testCode || t.name === currentSample.testName) || tests[0];
        setTestCatalog(matchingTest);
      } catch (err) {
        console.error('Failed to load result entry screen:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [sampleId]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <main className="pt-20 px-6 pb-12">
          <Breadcrumbs items={[{ label: 'Samples', path: '/samples' }, { label: sample?.sampleId || 'Sample' }, { label: 'Result Entry' }]} />

          {loading || !sample || !testCatalog ? (
            <div className="py-20 text-center text-xs text-slate-400">Loading parameter templates...</div>
          ) : (
            <ResultEntryForm sample={sample} testCatalog={testCatalog} existingResult={existingResult} />
          )}
        </main>
      </div>
    </div>
  );
};
