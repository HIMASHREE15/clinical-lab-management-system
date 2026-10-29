export type UserRole = 'Administrator' | 'Laboratory Technician' | 'Lab Technician' | 'Doctor' | 'Receptionist' | 'Patient';

export type WorkflowStageId =
  | 'REGISTERED'
  | 'COLLECTED'
  | 'RECEIVED_IN_LAB'
  | 'ASSIGNED'
  | 'UNDER_ANALYSIS'
  | 'QUALITY_CHECK'
  | 'RESULT_GENERATED'
  | 'DOCTOR_VERIFIED'
  | 'RELEASED'
  | 'DELIVERED';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  patientId?: string;
  phone?: string;
  department?: string;
  specialization?: string;
  avatar?: string;
  isActive?: boolean;
  roleHistory?: IUserRoleHistory[];
}

export interface PatientRegistrationInput {
  name: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  address?: string;
  emergencyContact?: string;
}

export interface IUserRoleHistory {
  administratorId: string;
  administratorName: string;
  previousRole: UserRole;
  newRole: UserRole;
  reason: string;
  timestamp: string;
}

export interface IPatient {
  _id: string;
  patientId: string;
  name: string;
  age: number;
  dateOfBirth?: string;
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  medicalHistory?: string[];
  createdAt: string;
  registeredAt?: string;
  userId?: string;
}

export interface ITestParameter {
  name: string;
  unit: string;
  minRef?: number;
  maxRef?: number;
  expectedValue?: string;
  choices?: string[];
}

export interface ITestCatalog {
  _id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  turnaroundHours: number;
  parameters: ITestParameter[];
}

export interface ITimelineStep {
  status: WorkflowStageId;
  label: string;
  timestamp: string;
  updatedBy: string;
  location: string;
  remarks?: string;
}

export interface ISample {
  _id: string;
  sampleId: string;
  patientId: string;
  patientName: string;
  patientAgeGender: string;
  doctorId?: string;
  doctorName?: string;
  assignedTechId?: string;
  assignedTechName?: string;
  testName: string;
  testCode: string;
  status: WorkflowStageId;
  priority: 'Normal' | 'Urgent' | 'Critical';
  sampleType: string;
  collectedAt: string;
  receivedAt?: string;
  timeline: ITimelineStep[];
  qrCodeUrl?: string;
  barcode?: string;
  createdAt: string;
}

export interface IResultParameterValue {
  parameterName: string;
  resultValue: string;
  unit: string;
  referenceRange: string;
  flag: 'NORMAL' | 'ABNORMAL_HIGH' | 'ABNORMAL_LOW' | 'CRITICAL';
  observation?: string;
}

export interface IResult {
  _id: string;
  sampleId: string;
  patientId: string;
  patientName: string;
  testName: string;
  entryMethod?: 'MANUAL' | 'FILE_UPLOAD';
  parameters: IResultParameterValue[];
  technicianRemarks?: string;
  testDate?: string;
  isDraft?: boolean;
  uploadedReportUrl?: string;
  uploadedReportFileName?: string;
  uploadedReportFileType?: string;
  uploadedReportFileSize?: number;
  doctorNotes?: string;
  isVerifiedByDoctor: boolean;
  verifiedByDoctorName?: string;
  verifiedAt?: string;
  releasedAt?: string;
  downloadCount: number;
  clinicalInsights: string[];
  createdAt: string;
}

export interface IAuditLog {
  _id: string;
  user: string;
  role: string;
  action: string;
  resource: string;
  details: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  timestamp: string;
}

export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
  isRead: boolean;
  sampleId?: string;
  createdAt: string;
}

export interface IDashboardAnalytics {
  summary: {
    totalSamples: number;
    inProgressSamples: number;
    completedSamples: number;
    pendingResults: number;
    criticalSamples: number;
    totalPatients: number;
    totalUsers: number;
    totalReports: number;
    avgTurnaroundMinutes: number;
  };
  sampleStatusOverview: { name: string; count: number; color: string }[];
  monthlySampleGrowth: { label: string; collected: number; inProgress: number; completed: number; pending: number }[];
  departmentWorkload: { department: string; samples: number; percentage: number }[];
  technicianPerformance: { name: string; processed: number; verified: number; avgTimeMinutes: number }[];
  recentSamples: ISample[];
}
