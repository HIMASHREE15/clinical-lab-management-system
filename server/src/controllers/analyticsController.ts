import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { dbStore } from '../services/dataStore';
import { ROLES } from '../config/constants';
import { getPatientForUser } from '../utils/patientAccess';

export const getDashboardAnalytics = async (req: AuthRequest, res: Response) => {
  let samples = dbStore.getSamples();
  let results = dbStore.getResults();
  let patients = await dbStore.getPatients();
  const isPatient = req.user?.role === ROLES.PATIENT;

  if (isPatient && req.user) {
    const patient = await getPatientForUser(req.user);
    samples = patient
      ? samples.filter((sample) => {
          const sPid = typeof sample.patientId === 'string' ? sample.patientId : (sample.patientId as any)?._id;
          return sPid === patient._id || sPid === patient.patientId;
        })
      : [];
    results = patient
      ? results.filter((result) => (result.patientId === patient._id || result.patientId === patient.patientId) && Boolean(result.releasedAt))
      : [];
    patients = patient ? [patient] : [];
  }

  const totalSamples = samples.length;
  const inProgressSamples = samples.filter(
    (s) => s.status !== 'DELIVERED' && s.status !== 'RELEASED' && s.status !== 'REGISTERED'
  ).length;
  const completedSamples = samples.filter((s) => s.status === 'DELIVERED' || s.status === 'RELEASED').length;
  const pendingResults = samples.filter(
    (s) => s.status === 'UNDER_ANALYSIS' || s.status === 'QUALITY_CHECK' || s.status === 'ASSIGNED'
  ).length;
  const criticalSamples = samples.filter((s) => s.priority === 'Critical').length;

  const sampleStatusOverview = [
    { name: 'Collected', count: samples.filter((s) => s.status === 'COLLECTED').length, color: '#3b82f6' },
    { name: 'In Progress', count: inProgressSamples, color: '#f59e0b' },
    { name: 'Completed', count: completedSamples, color: '#10b981' },
    { name: 'Pending Result', count: pendingResults, color: '#ef4444' },
  ];

  const monthlySampleGrowth = [
    { label: '1 May', collected: 20, inProgress: 5, completed: 15, pending: 2 },
    { label: '8 May', collected: 35, inProgress: 12, completed: 28, pending: 4 },
    { label: '15 May', collected: 50, inProgress: 18, completed: 42, pending: 5 },
    { label: '22 May', collected: 85, inProgress: 25, completed: 70, pending: 8 },
    { label: '29 May', collected: 128, inProgress: 36, completed: 82, pending: 10 },
  ];

  const departmentWorkload = [
    { department: 'Hematology', samples: 45, percentage: 35 },
    { department: 'Urinalysis', samples: 32, percentage: 25 },
    { department: 'Biochemistry', samples: 28, percentage: 22 },
    { department: 'Endocrinology', samples: 23, percentage: 18 },
  ];

  const technicianPerformance = [
    { name: 'Nurse Revathi', processed: 64, verified: 58, avgTimeMinutes: 32 },
    { name: 'Tech Marcus', processed: 42, verified: 40, avgTimeMinutes: 28 },
    { name: 'Tech Brenda', processed: 22, verified: 20, avgTimeMinutes: 35 },
  ];

  return res.json({
    success: true,
    summary: {
      totalSamples,
      inProgressSamples,
      completedSamples,
      pendingResults,
      criticalSamples,
      totalPatients: patients.length,
      totalUsers: isPatient ? 0 : await dbStore.getUserCount(),
      totalReports: results.length,
      avgTurnaroundMinutes: 45,
    },
    sampleStatusOverview,
    monthlySampleGrowth: isPatient ? [] : monthlySampleGrowth,
    departmentWorkload: isPatient ? [] : departmentWorkload,
    technicianPerformance: isPatient ? [] : technicianPerformance,
    recentSamples: samples.slice(0, 5),
  });
};
