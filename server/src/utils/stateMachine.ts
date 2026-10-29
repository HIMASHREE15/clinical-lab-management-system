import { WorkflowStageId, WORKFLOW_STAGES } from '../config/constants';

export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  REGISTERED: ['COLLECTED', 'REJECTED'],
  COLLECTED: ['RECEIVED_IN_LAB', 'RECEIVED', 'REJECTED'],
  RECEIVED_IN_LAB: ['ASSIGNED', 'QUALITY_CHECK', 'UNDER_ANALYSIS', 'REJECTED'],
  RECEIVED: ['ASSIGNED', 'QUALITY_CHECK', 'UNDER_ANALYSIS', 'REJECTED'],
  ASSIGNED: ['UNDER_ANALYSIS', 'IN_ANALYSIS', 'QUALITY_CHECK', 'REJECTED'],
  UNDER_ANALYSIS: ['QUALITY_CHECK', 'QUALITY_VERIFICATION', 'RESULT_GENERATED', 'RETEST_REQUESTED', 'REJECTED'],
  IN_ANALYSIS: ['QUALITY_CHECK', 'QUALITY_VERIFICATION', 'RESULT_GENERATED', 'RETEST_REQUESTED', 'REJECTED'],
  QUALITY_CHECK: ['RESULT_GENERATED', 'ASSIGNED', 'UNDER_ANALYSIS', 'REJECTED', 'RETEST_REQUESTED'],
  QUALITY_VERIFICATION: ['RESULT_GENERATED', 'RETEST_REQUESTED'],
  RESULT_GENERATED: ['DOCTOR_VERIFIED', 'DOCTOR_VERIFICATION', 'RELEASED', 'RETEST_REQUESTED'],
  DOCTOR_VERIFIED: ['RELEASED', 'DELIVERED', 'RETEST_REQUESTED'],
  DOCTOR_VERIFICATION: ['RELEASED', 'DELIVERED', 'RETEST_REQUESTED'],
  RELEASED: ['DELIVERED'],
  DELIVERED: [],
  REJECTED: ['REGISTERED', 'COLLECTED'],
  RETEST_REQUESTED: ['UNDER_ANALYSIS', 'IN_ANALYSIS', 'ASSIGNED', 'COLLECTED'],
};

export const validateStateTransition = (
  currentStatus: string,
  targetStatus: string
): { valid: boolean; message?: string } => {
  if (currentStatus === targetStatus) {
    return { valid: true };
  }

  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    // Also check if it's the immediate next step in sequential workflow
    const currentIdx = WORKFLOW_STAGES.findIndex((s) => s.id === currentStatus);
    const targetIdx = WORKFLOW_STAGES.findIndex((s) => s.id === targetStatus);
    if (currentIdx !== -1 && targetIdx === currentIdx + 1) {
      return { valid: true };
    }

    return {
      valid: false,
      message: `Invalid state transition. Cannot transition sample from '${currentStatus}' directly to '${targetStatus}'. Allowed next states: [${allowed.join(', ')}]`,
    };
  }

  return { valid: true };
};
