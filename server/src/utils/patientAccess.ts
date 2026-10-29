import { IUser } from '../types';
import { ROLES } from '../config/constants';
import { dbStore } from '../services/dataStore';

export const getPatientForUser = (user: IUser) => dbStore.findPatientForUser(user);

export const isPatientOwner = async (user: IUser, patientId: string) => {
  if (user.role !== ROLES.PATIENT) return true;
  const patient = await getPatientForUser(user);
  if (!patient) return false;
  return patient._id === patientId || patient.patientId === patientId;
};
