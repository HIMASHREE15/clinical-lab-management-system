import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { dbStore } from '../services/dataStore';
import { generateSampleQRCode } from '../services/qrService';
import { WORKFLOW_STAGES, WorkflowStageId, ROLES } from '../config/constants';
import { validateStateTransition } from '../utils/stateMachine';
import { ISample, ITimelineStep } from '../types';
import { getPatientForUser, isPatientOwner } from '../utils/patientAccess';

export const getSamples = async (req: AuthRequest, res: Response) => {
  const { search, status, priority, patientId } = req.query;
  let samples = dbStore.getSamples();

  if (req.user?.role === ROLES.PATIENT) {
    const patient = await getPatientForUser(req.user);
    samples = patient
      ? samples.filter((sample) => {
          const sPid = typeof sample.patientId === 'string' ? sample.patientId : (sample.patientId as any)?._id;
          return sPid === patient._id || sPid === patient.patientId;
        })
      : [];
  }

  if (search) {
    const query = String(search).toLowerCase();
    samples = samples.filter(
      (s) =>
        s.sampleId.toLowerCase().includes(query) ||
        s.patientName.toLowerCase().includes(query) ||
        s.testName.toLowerCase().includes(query) ||
        s.testCode.toLowerCase().includes(query)
    );
  }

  if (status) {
    samples = samples.filter((s) => s.status === status);
  }

  if (priority) {
    samples = samples.filter((s) => s.priority === priority);
  }

  if (patientId) {
    const pIdStr = String(patientId);
    samples = samples.filter((s) => {
      const sPid = typeof s.patientId === 'string' ? s.patientId : (s.patientId as any)?._id;
      return sPid === pIdStr || (s.patientId as any)?.patientId === pIdStr;
    });
  }

  return res.json({ success: true, count: samples.length, samples });
};

export const getSampleById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const sample = dbStore.findSampleById(id);

  if (!sample) {
    return res.status(404).json({ success: false, message: 'Sample not found' });
  }

  const patientId = typeof sample.patientId === 'string' ? sample.patientId : sample.patientId._id;
  if (req.user && !(await isPatientOwner(req.user, patientId))) {
    return res.status(404).json({ success: false, message: 'Sample not found' });
  }

  const result = dbStore.findResultBySampleId(sample.sampleId);
  const patient = await dbStore.findPatientById(patientId);

  const visibleResult = req.user?.role === ROLES.PATIENT && !result?.releasedAt ? undefined : result;
  return res.json({ success: true, sample, result: visibleResult, patient });
};

export const createSample = async (req: AuthRequest, res: Response) => {
  const { patientId, testCode, priority, sampleType, notes } = req.body;

  if (!patientId || !testCode) {
    return res.status(400).json({ success: false, message: 'Patient and Test are required' });
  }

  const patient = await dbStore.findPatientById(patientId);
  if (!patient) {
    return res.status(400).json({ success: false, message: 'Invalid patient specified' });
  }

  const test = dbStore.getTests().find((t) => t.code === testCode || t._id === testCode);
  if (!test) {
    return res.status(400).json({ success: false, message: 'Invalid test catalog code' });
  }

  const nextNum = dbStore.getSamples().length + 1001;
  const sampleId = `LAB-2026-${String(nextNum).padStart(6, '0')}`;
  const qrCodeUrl = await generateSampleQRCode(sampleId);

  const initialTimeline: ITimelineStep[] = [
    {
      status: 'REGISTERED',
      label: 'Sample Registered',
      timestamp: new Date(),
      updatedBy: req.user?.name || 'Receptionist',
      location: 'Reception Desk / Intake',
      remarks: notes || 'Sample registered for intake',
    },
  ];

  const newSample: ISample = {
    _id: `smp-${Date.now()}`,
    sampleId,
    patientId: patient._id,
    patientName: patient.name,
    patientAgeGender: `${patient.age} / ${patient.gender}`,
    doctorId: 'usr-doc-1',
    doctorName: 'Dr. Karthik MD',
    assignedTechId: 'usr-tech-1',
    assignedTechName: 'Nurse Revathi',
    testName: test.name,
    testCode: test.code,
    status: 'REGISTERED',
    priority: priority || 'Normal',
    sampleType: sampleType || 'Blood',
    collectedAt: new Date(),
    timeline: initialTimeline,
    qrCodeUrl,
    barcode: `||| | || ${sampleId} ||`,
    createdAt: new Date(),
  };

  dbStore.addSample(newSample);

  dbStore.addAuditLog({
    user: req.user?.name || 'System',
    role: req.user?.role || 'System',
    action: 'REGISTER_SAMPLE',
    resource: sampleId,
    details: `Created new sample ${sampleId} for patient ${patient.name}`,
    ipAddress: req.ip || '127.0.0.1',
  });

  return res.status(201).json({ success: true, sample: newSample });
};

export const updateStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, remarks, location } = req.body;

  if (req.user?.role === ROLES.RECEPTIONIST && status !== 'COLLECTED') {
    return res.status(403).json({ success: false, message: 'Receptionists may only mark a registered sample as collected.' });
  }

  const sample = dbStore.findSampleById(id);
  if (!sample) {
    return res.status(404).json({ success: false, message: 'Sample not found' });
  }

  // Centralized State Machine Check
  const transitionCheck = validateStateTransition(sample.status, status);
  if (!transitionCheck.valid) {
    return res.status(400).json({
      success: false,
      message: transitionCheck.message,
    });
  }

  const oldStatus = sample.status;
  const stageObj = WORKFLOW_STAGES.find((st) => st.id === status) || { label: status, step: 0 };

  const newTimelineStep: ITimelineStep = {
    status: status as any,
    label: stageObj.label,
    timestamp: new Date(),
    updatedBy: req.user?.name || 'Lab Staff',
    location: location || 'Laboratory Operations',
    remarks: remarks || `Transitioned to ${stageObj.label}`,
  };

  const updatedTimeline = [...sample.timeline, newTimelineStep];

  const updated = dbStore.updateSample(sample.sampleId, {
    status: status as any,
    timeline: updatedTimeline,
    ...(status === 'RECEIVED_IN_LAB' || status === 'RECEIVED' ? { receivedAt: new Date() } : {}),
  });

  dbStore.addAuditLog({
    user: req.user?.name || 'System',
    role: req.user?.role || 'Staff',
    action: 'UPDATE_SAMPLE_STATUS',
    resource: sample.sampleId,
    details: `Sample status transitioned from ${oldStatus} to ${status}`,
    oldValue: oldStatus,
    newValue: status,
    ipAddress: req.ip || '127.0.0.1',
  });

  return res.json({ success: true, sample: updated });
};
