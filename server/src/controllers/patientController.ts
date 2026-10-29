import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { dbStore } from '../services/dataStore';
import { IPatient } from '../types';
import { getPatientForUser } from '../utils/patientAccess';
import { ROLES } from '../config/constants';

export const getPatients = async (req: AuthRequest, res: Response) => {
  const { search } = req.query;
  let patients = await dbStore.getPatients();

  if (search) {
    const q = String(search).toLowerCase();
    patients = patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.patientId.toLowerCase().includes(q) ||
        p.contact.includes(q)
    );
  }

  return res.json({ success: true, count: patients.length, patients });
};

export const registerPatient = async (req: AuthRequest, res: Response) => {
  const { name, age, gender, contact, email, address, bloodGroup, emergencyContact, medicalHistory } = req.body;

  if (!name || !age || !gender || !contact) {
    return res.status(400).json({ success: false, message: 'Name, age, gender, and contact phone are required' });
  }

  const existingPatient = (email && await dbStore.findPatientByEmail(email)) || (await dbStore.findPatientByContact(contact));
  if (existingPatient) {
    return res.status(409).json({
      success: false,
      message: `Patient already exists with ID ${existingPatient.patientId}. Search for that patient instead of creating a duplicate.`,
      patient: existingPatient,
    });
  }

  const newPatient: IPatient = await dbStore.createPatientProfile({
    name,
    age: Number(age),
    gender,
    contact,
    email: email || '',
    address: address || '',
    bloodGroup: bloodGroup || 'O+',
    emergencyContact: emergencyContact || '',
    medicalHistory: Array.isArray(medicalHistory) ? medicalHistory : [],
    createdAt: new Date(),
    registeredAt: new Date(),
  });
  const patientId = newPatient.patientId;

  dbStore.addAuditLog({
    user: req.user?.name || 'Staff',
    role: req.user?.role || 'Staff',
    action: 'REGISTER_PATIENT',
    resource: patientId,
    details: `Registered new patient ${name} (${patientId})`,
    ipAddress: req.ip || '127.0.0.1',
  });

  return res.status(201).json({ success: true, patient: newPatient });
};

export const getPatientHistory = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  let patient: IPatient | undefined;
  if (id === 'me' && req.user) {
    patient = await getPatientForUser(req.user);
  } else {
    patient = await dbStore.findPatientById(id);
    if (!patient && req.user?.role === ROLES.PATIENT) {
      patient = await getPatientForUser(req.user);
    }
  }
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

  if (req.user?.role === ROLES.PATIENT && (await getPatientForUser(req.user))?._id !== patient._id) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }

  const patientObj = patient;
  const samples = dbStore.getSamples().filter((sample) => {
    const sPid = typeof sample.patientId === 'string' ? sample.patientId : (sample.patientId as any)?._id;
    return sPid === patientObj._id || sPid === patientObj.patientId;
  });
  const results = dbStore.getResults().filter((result) =>
    (result.patientId === patientObj._id || result.patientId === patientObj.patientId) &&
    (req.user?.role !== ROLES.PATIENT || Boolean(result.releasedAt))
  );

  return res.json({ success: true, patient, samples, results });
};
