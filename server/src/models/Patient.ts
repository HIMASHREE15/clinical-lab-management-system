import mongoose, { Schema } from 'mongoose';
import { IPatient } from '../types';

const patientSchema = new Schema<IPatient>({
  _id: { type: String, required: true },
  patientId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, unique: true, sparse: true, index: true },
  name: { type: String, required: true, trim: true },
  age: { type: Number, required: true, min: 0 },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  contact: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  address: { type: String, default: '' },
  emergencyContact: { type: String, default: '' },
  bloodGroup: { type: String },
  medicalHistory: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  registeredAt: { type: Date, default: Date.now },
});

export const PatientModel = mongoose.models.Patient || mongoose.model<IPatient>('Patient', patientSchema);