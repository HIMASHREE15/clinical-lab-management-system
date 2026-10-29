import { WorkflowStageId } from '../types';

export const WORKFLOW_STAGES: { id: WorkflowStageId; label: string; step: number }[] = [
  { id: 'REGISTERED', label: 'Sample Registered', step: 1 },
  { id: 'COLLECTED', label: 'Collected', step: 2 },
  { id: 'RECEIVED_IN_LAB', label: 'Received in Laboratory', step: 3 },
  { id: 'ASSIGNED', label: 'Assigned to Technician', step: 4 },
  { id: 'UNDER_ANALYSIS', label: 'Under Analysis', step: 5 },
  { id: 'QUALITY_CHECK', label: 'Quality Verification', step: 6 },
  { id: 'RESULT_GENERATED', label: 'Result Generated', step: 7 },
  { id: 'DOCTOR_VERIFIED', label: 'Doctor Verification', step: 8 },
  { id: 'RELEASED', label: 'Released', step: 9 },
  { id: 'DELIVERED', label: 'Delivered', step: 10 },
];

export const MEDICAL_DISCLAIMER = "INFORMATIONAL NOTICE: Laboratory findings and calculated parameter flags provided by this system are for clinical guidance only. They do NOT constitute a medical diagnosis. A qualified licensed physician must interpret all results in conjunction with clinical patient presentation.";
