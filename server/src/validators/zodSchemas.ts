import { z } from 'zod';
import { ROLES } from '../config/constants';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date of birth').refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && date <= new Date();
  }, 'Date of birth must be a valid date in the past'),
  gender: z.enum(['Male', 'Female', 'Other']),
  phone: z.string().trim().regex(/^\+?[0-9()\-\s]{7,20}$/, 'Enter a valid mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  address: z.string().trim().max(500, 'Address is too long').optional().default(''),
  emergencyContact: z.string().trim().regex(/^$|^\+?[0-9()\-\s]{7,20}$/, 'Enter a valid emergency contact number').optional().default(''),
}).strict().refine((registration) => registration.password === registration.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const createUserByAdminSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Administrator', 'Laboratory Technician', 'Lab Technician', 'Doctor', 'Receptionist', 'Patient']),
  phone: z.string().optional(),
  department: z.string().optional(),
});

export const changeUserRoleSchema = z.object({
  newRole: z.enum(['Administrator', 'Laboratory Technician', 'Lab Technician', 'Doctor', 'Receptionist', 'Patient']),
  reason: z.string().min(3, 'A valid reason for changing the role is required'),
});

export const toggleUserStatusSchema = z.object({
  isActive: z.boolean(),
  reason: z.string().optional(),
});

export const createPatientSchema = z.object({
  name: z.string().min(2, 'Patient full name is required'),
  age: z.number().min(0, 'Age must be non-negative'),
  gender: z.enum(['Male', 'Female', 'Other']),
  contact: z.string().min(5, 'Valid phone contact is required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  bloodGroup: z.string().optional(),
  emergencyContact: z.string().optional(),
  medicalHistory: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
});

export const createSampleSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  testCode: z.string().min(1, 'Test code is required'),
  priority: z.enum(['Normal', 'Urgent', 'Critical']).default('Normal'),
  sampleType: z.string().default('Whole Blood'),
  notes: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.string().min(1, 'Target status is required'),
  remarks: z.string().optional(),
  location: z.string().optional(),
});

export const qualityCheckSchema = z.object({
  integrity: z.boolean(),
  sufficientQuantity: z.boolean(),
  correctContainer: z.boolean(),
  labelVerified: z.boolean(),
  remarks: z.string().optional(),
  passed: z.boolean(),
});

export const saveResultSchema = z.object({
  sampleId: z.string().min(1, 'Sample ID is required'),
  parameters: z.array(
    z.object({
      parameterName: z.string(),
      resultValue: z.string(),
      unit: z.string().optional(),
      referenceRange: z.string().optional(),
      flag: z.enum(['NORMAL', 'ABNORMAL_HIGH', 'ABNORMAL_LOW', 'CRITICAL']).optional(),
      observation: z.string().optional(),
    })
  ),
  technicianRemarks: z.string().optional(),
});

export const verifyResultSchema = z.object({
  doctorNotes: z.string().optional(),
  releaseImmediately: z.boolean().optional(),
});
