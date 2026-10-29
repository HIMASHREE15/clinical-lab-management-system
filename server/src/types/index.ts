import { UserRole, WorkflowStageId } from '../config/constants';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  department?: string;
  specialization?: string;
  avatar?: string;
  isActive?: boolean;
  patientId?: string;
  createdAt: Date;
  roleHistory?: IUserRoleHistory[];
}

export interface IUserRoleHistory {
  administratorId: string;
  administratorName: string;
  previousRole: UserRole;
  newRole: UserRole;
  reason: string;
  timestamp: Date;
}

export interface IPatient {
  _id: string;
  patientId: string; // e.g. PT1002
  name: string;
  age: number;
  dateOfBirth?: Date;
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  medicalHistory?: string[];
  createdAt: Date;
  registeredAt?: Date;
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
  timestamp: Date;
  updatedBy: string; // User name or ID
  location: string;
  remarks?: string;
}

export interface ISample {
  _id: string;
  sampleId: string; // e.g. SMP1002
  patientId: string | IPatient;
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
  sampleType: string; // Blood, Urine, Saliva, Tissue, etc.
  collectedAt: Date;
  receivedAt?: Date;
  timeline: ITimelineStep[];
  qrCodeUrl?: string;
  barcode?: string;
  createdAt: Date;
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
  testDate?: Date | string;
  isDraft?: boolean;
  uploadedReportUrl?: string;
  uploadedReportFileName?: string;
  uploadedReportFileType?: string;
  uploadedReportFileSize?: number;
  doctorNotes?: string;
  isVerifiedByDoctor: boolean;
  verifiedByDoctorName?: string;
  verifiedAt?: Date;
  releasedAt?: Date;
  downloadCount: number;
  clinicalInsights: string[];
  createdAt: Date;
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
  timestamp: Date;
}

export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
  isRead: boolean;
  sampleId?: string;
  createdAt: Date;
}
