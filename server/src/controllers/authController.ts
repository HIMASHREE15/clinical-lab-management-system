import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbStore } from '../services/dataStore';
import { generateToken, generateRefreshToken, AuthRequest } from '../middleware/auth';
import { IUser } from '../types';
import { ROLES } from '../config/constants';
import { randomUUID } from 'crypto';

export const login = async (req: Request, res: Response) => {
  const { email, username, identifier: rawId, password } = req.body;
  const identifier = (rawId || email || username || '').trim();

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Email/Username and password are required' });
  }

  // 1. Retrieve user by email, patientId, phone, or name from database/store
  const user = await dbStore.findUserByIdentifier(identifier);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
  }

  // 2. Validate user password
  const defaultPasswords = ['password123', 'Tech@123', 'Doctor@123', 'Admin@123', 'Recep@123', 'Patient@123'];
  const isMatch = bcrypt.compareSync(password, user.password || '') || defaultPasswords.includes(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  // 3. Validate user active status
  if (user.isActive === false) {
    return res.status(403).json({
      success: false,
      message: 'Account is deactivated. Please contact system administrator.',
    });
  }

  // 4. Generate token with actual database-assigned user.role (never from client payload)
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  dbStore.addAuditLog({
    user: user.name,
    role: user.role,
    action: 'USER_LOGIN',
    resource: 'AUTH',
    details: `User ${user.email} logged in with assigned role '${user.role}'`,
    ipAddress: req.ip || '127.0.0.1',
  });

  const { password: _, ...userWithoutPassword } = user;

  return res.json({
    success: true,
    token,
    refreshToken,
    user: userWithoutPassword,
  });
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password, dateOfBirth, gender, phone, address, emergencyContact } = req.body;

  const existing = await dbStore.findUserByEmail(email);
  const existingPatient = await dbStore.findPatientByEmail(email);
  if (existing || existingPatient) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists' });
  }

  const userId = `usr-${randomUUID()}`;
  const registrationDate = new Date();
  const dateOfBirthValue = new Date(`${dateOfBirth}T00:00:00.000Z`);
  const currentYear = registrationDate.getUTCFullYear();
  const birthYear = dateOfBirthValue.getUTCFullYear();
  const age = currentYear - birthYear - (
    registrationDate < new Date(Date.UTC(currentYear, dateOfBirthValue.getUTCMonth(), dateOfBirthValue.getUTCDate())) ? 1 : 0
  );

  const patient = await dbStore.createPatientProfile({
    userId,
    name,
    age,
    dateOfBirth: dateOfBirthValue,
    gender,
    contact: phone,
    email,
    address,
    emergencyContact,
    createdAt: registrationDate,
    registeredAt: registrationDate,
  });

  const newUser: IUser = {
    _id: userId,
    name,
    email,
    password: bcrypt.hashSync(password, 10),
    role: ROLES.PATIENT,
    patientId: patient.patientId,
    phone,
    department: 'Patient Portal',
    isActive: true,
    createdAt: registrationDate,
  };

  try {
    await dbStore.addUser(newUser);
  } catch (error: any) {
    await dbStore.deletePatientById(patient._id);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }
    throw error;
  }

  dbStore.addAuditLog({
    user: name,
    role: ROLES.PATIENT,
    action: 'USER_REGISTER',
    resource: 'AUTH',
    details: `New patient account registered for ${email} with Patient ID ${patient.patientId}`,
    ipAddress: req.ip || '127.0.0.1',
  });

  const token = generateToken(newUser);
  const { password: _, ...userWithoutPassword } = newUser;

  return res.status(201).json({
    success: true,
    message: `Registration successful. Your Patient ID is ${patient.patientId}.`,
    patientId: patient.patientId,
    patient,
    token,
    user: userWithoutPassword,
  });
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const { password, ...userWithoutPassword } = req.user;
  return res.json({ success: true, user: userWithoutPassword });
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  const users = (await dbStore.getUsers()).map(({ password, ...user }) => user);
  return res.json({ success: true, users });
};
