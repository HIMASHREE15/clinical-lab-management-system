import mongoose, { Schema } from 'mongoose';
import { ALL_ROLES, ROLES, UserRole } from '../config/constants';
import { IUser } from '../types';

const roleHistorySchema = new Schema(
  {
    administratorId: { type: String, required: true },
    administratorName: { type: String, required: true },
    previousRole: { type: String, enum: ALL_ROLES as UserRole[], required: true },
    newRole: { type: String, enum: ALL_ROLES as UserRole[], required: true },
    reason: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>({
  _id: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ALL_ROLES, default: ROLES.PATIENT, required: true },
  phone: { type: String, default: '' },
  patientId: { type: String, index: true },
  department: { type: String, default: '' },
  specialization: { type: String },
  avatar: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  roleHistory: { type: [roleHistorySchema], default: [] },
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
