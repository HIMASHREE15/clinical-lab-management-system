import { randomUUID } from 'crypto';
import { IUser, IUserRoleHistory, IPatient, ITestCatalog, ISample, IResult, IAuditLog, INotification } from '../types';
import { SEED_USERS, SEED_PATIENTS, SEED_TESTS, SEED_SAMPLES, SEED_RESULTS, SEED_AUDIT_LOGS, SEED_NOTIFICATIONS } from '../utils/seedData';
import { isMongoConnected } from '../config/db';
import { PatientModel } from '../models/Patient';
import { SequenceCounterModel } from '../models/SequenceCounter';
import { UserModel } from '../models/User';

class DataStore {
  public users: IUser[] = [...SEED_USERS];
  public patients: IPatient[] = [...SEED_PATIENTS];
  public tests: ITestCatalog[] = [...SEED_TESTS];
  public samples: ISample[] = [...SEED_SAMPLES];
  public results: IResult[] = [...SEED_RESULTS];
  public auditLogs: IAuditLog[] = [...SEED_AUDIT_LOGS];
  public notifications: INotification[] = [...SEED_NOTIFICATIONS];

  // User Operations
  async findUserByEmail(email: string): Promise<IUser | undefined> {
    if (isMongoConnected) {
      return (await UserModel.findOne({ email: email.toLowerCase() }).select('+password').lean<IUser>().exec()) || undefined;
    }
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  async findUserByIdentifier(identifier: string): Promise<IUser | undefined> {
    const clean = identifier.trim();
    const cleanLower = clean.toLowerCase();

    // Alias mapping for common lab staff credentials/usernames
    const isTechAlias = ['tech1@labcorp.com', 'tech_sarah', 'tech1', 'tech', 'technician', 'tech@clinicallab.com', 'nurse revathi', 'sarah jenkins'].includes(cleanLower);
    const isAdminAlias = ['admin', 'admin@labcorp.com', 'admin@clinicallab.com', 'system admin', 'arthur pendelton'].includes(cleanLower);
    const isDoctorAlias = ['dr_karthik', 'doctor1@labcorp.com', 'doctor@clinicallab.com', 'doctor', 'karthik', 'dr. karthik md'].includes(cleanLower);
    const isRecepAlias = ['reception_priya', 'reception1@labcorp.com', 'reception@clinicallab.com', 'reception', 'sarah connor', 'priya sharma'].includes(cleanLower);
    const isPatientAlias = ['john_doe', 'patient', 'patient@clinicallab.com', 'patient1@labcorp.com', 'pt1001', 'pt1002', 'anitha r'].includes(cleanLower);

    if (isMongoConnected) {
      // 1. Try finding by email
      let user = await UserModel.findOne({ email: cleanLower }).select('+password').lean<IUser>().exec();
      if (user) return user;

      // 2. Try alias lookups
      if (isTechAlias) {
        user = await UserModel.findOne({
          $or: [
            { email: { $in: ['tech1@labcorp.com', 'tech@clinicallab.com'] } },
            { role: { $in: ['Lab Technician', 'Laboratory Technician'] } },
          ],
        }).select('+password').lean<IUser>().exec();
        if (user) return user;
      }

      if (isAdminAlias) {
        user = await UserModel.findOne({
          $or: [
            { email: { $in: ['admin@labcorp.com', 'admin@clinicallab.com'] } },
            { role: 'Administrator' },
          ],
        }).select('+password').lean<IUser>().exec();
        if (user) return user;
      }

      if (isDoctorAlias) {
        user = await UserModel.findOne({
          $or: [
            { email: { $in: ['doctor1@labcorp.com', 'doctor@clinicallab.com'] } },
            { role: 'Doctor' },
          ],
        }).select('+password').lean<IUser>().exec();
        if (user) return user;
      }

      if (isRecepAlias) {
        user = await UserModel.findOne({
          $or: [
            { email: { $in: ['reception1@labcorp.com', 'reception@clinicallab.com'] } },
            { role: 'Receptionist' },
          ],
        }).select('+password').lean<IUser>().exec();
        if (user) return user;
      }

      if (isPatientAlias) {
        user = await UserModel.findOne({
          $or: [
            { email: { $in: ['patient1@labcorp.com', 'patient@clinicallab.com'] } },
            { patientId: { $in: ['PT1001', 'PT1002'] } },
          ],
        }).select('+password').lean<IUser>().exec();
        if (user) return user;
      }

      // 3. Try finding by patientId
      user = await UserModel.findOne({ patientId: clean }).select('+password').lean<IUser>().exec();
      if (user) return user;

      // 4. Try finding by phone
      user = await UserModel.findOne({ phone: clean }).select('+password').lean<IUser>().exec();
      if (user) return user;

      // 5. Try finding by name (case-insensitive)
      user = await UserModel.findOne({ name: { $regex: new RegExp(`^${clean}$`, 'i') } }).select('+password').lean<IUser>().exec();
      if (user) return user;

      // 6. Look in PatientModel to find linked user
      const patient = await PatientModel.findOne({
        $or: [
          { patientId: clean },
          { email: cleanLower },
          { contact: clean },
          { name: { $regex: new RegExp(`^${clean}$`, 'i') } },
        ],
      }).lean<IPatient>().exec();

      if (patient) {
        if (patient.userId) {
          user = await UserModel.findById(patient.userId).select('+password').lean<IUser>().exec();
          if (user) return user;
        }
        if (patient.email) {
          user = await UserModel.findOne({ email: patient.email.toLowerCase() }).select('+password').lean<IUser>().exec();
          if (user) return user;
        }
      }

      return undefined;
    }

    // In-memory fallback
    let user = this.users.find((u) => u.email.toLowerCase() === cleanLower);
    if (user) return user;

    if (isTechAlias) {
      user = this.users.find((u) => u.email === 'tech1@labcorp.com' || u.email === 'tech@clinicallab.com' || u.role === 'Lab Technician' || u.role === 'Laboratory Technician');
      if (user) return user;
    }
    if (isAdminAlias) {
      user = this.users.find((u) => u.email === 'admin@labcorp.com' || u.email === 'admin@clinicallab.com' || u.role === 'Administrator');
      if (user) return user;
    }
    if (isDoctorAlias) {
      user = this.users.find((u) => u.email === 'doctor1@labcorp.com' || u.email === 'doctor@clinicallab.com' || u.role === 'Doctor');
      if (user) return user;
    }
    if (isRecepAlias) {
      user = this.users.find((u) => u.email === 'reception1@labcorp.com' || u.email === 'reception@clinicallab.com' || u.role === 'Receptionist');
      if (user) return user;
    }

    user = this.users.find((u) => u.patientId === clean);
    if (user) return user;
    user = this.users.find((u) => u.phone === clean);
    if (user) return user;
    user = this.users.find((u) => u.name.toLowerCase() === cleanLower);
    if (user) return user;

    const patient = this.patients.find(
      (p) =>
        p.patientId === clean ||
        p.email?.toLowerCase() === cleanLower ||
        p.contact === clean ||
        p.name.toLowerCase() === cleanLower
    );
    if (patient) {
      if (patient.userId) {
        user = this.users.find((u) => u._id === patient.userId);
        if (user) return user;
      }
      if (patient.email) {
        user = this.users.find((u) => u.email.toLowerCase() === patient.email?.toLowerCase());
        if (user) return user;
      }
    }

    return undefined;
  }

  async findUserById(id: string): Promise<IUser | undefined> {
    if (isMongoConnected) {
      return (await UserModel.findById(id).select('+password').lean<IUser>().exec()) || undefined;
    }
    return this.users.find((u) => u._id === id);
  }

  async addUser(user: IUser): Promise<IUser> {
    if (isMongoConnected) {
      const createdUser = await UserModel.create(user);
      return createdUser.toObject() as IUser;
    }
    this.users.unshift(user);
    return user;
  }

  async getUsers(): Promise<IUser[]> {
    if (isMongoConnected) {
      return UserModel.find().lean<IUser[]>().exec();
    }
    return this.users;
  }

  async getUserCount(): Promise<number> {
    if (isMongoConnected) {
      return UserModel.countDocuments().exec();
    }
    return this.users.length;
  }

  async getUserRoleHistory(id: string): Promise<IUserRoleHistory[] | undefined> {
    const user = await this.findUserById(id);
    return user ? user.roleHistory || [] : undefined;
  }

  async updateUserRole(id: string, role: IUser['role'], history: IUserRoleHistory): Promise<IUser | undefined> {
    if (isMongoConnected) {
      return (await UserModel.findByIdAndUpdate(
        id,
        { $set: { role }, $push: { roleHistory: history } },
        { new: true, runValidators: true }
      ).select('+password').lean<IUser>().exec()) || undefined;
    }
    const user = this.users.find((entry) => entry._id === id);
    if (!user) return undefined;
    user.role = role;
    user.roleHistory = [...(user.roleHistory || []), history];
    return user;
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<IUser | undefined> {
    if (isMongoConnected) {
      return (await UserModel.findByIdAndUpdate(id, { $set: { isActive } }, { new: true }).select('+password').lean<IUser>().exec()) || undefined;
    }
    const user = this.users.find((entry) => entry._id === id);
    if (!user) return undefined;
    user.isActive = isActive;
    return user;
  }

  // Patient Operations
  async getPatients(): Promise<IPatient[]> {
    if (isMongoConnected) {
      return PatientModel.find().lean<IPatient[]>().exec();
    }
    return this.patients;
  }

  async findPatientById(id: string): Promise<IPatient | undefined> {
    if (isMongoConnected) {
      return (await PatientModel.findOne({ $or: [{ _id: id }, { patientId: id }] }).lean<IPatient>().exec()) || undefined;
    }
    return this.patients.find((p) => p._id === id || p.patientId === id);
  }

  async findPatientByEmail(email: string): Promise<IPatient | undefined> {
    if (isMongoConnected) {
      return (await PatientModel.findOne({ email: email.toLowerCase() }).lean<IPatient>().exec()) || undefined;
    }
    return this.patients.find((patient) => patient.email?.toLowerCase() === email.toLowerCase());
  }

  async findPatientForUser(user: IUser): Promise<IPatient | undefined> {
    if (isMongoConnected) {
      const conditions: Array<{ userId?: string; email?: string; patientId?: string }> = [
        { userId: user._id },
        { email: user.email.toLowerCase() },
      ];
      if (user.patientId) conditions.push({ patientId: user.patientId });
      return (await PatientModel.findOne({ $or: conditions }).lean<IPatient>().exec()) || undefined;
    }
    return this.patients.find(
      (patient) => patient.userId === user._id || patient.email?.toLowerCase() === user.email.toLowerCase() || patient.patientId === user.patientId
    );
  }

  async findPatientByContact(contact: string): Promise<IPatient | undefined> {
    if (isMongoConnected) {
      return (await PatientModel.findOne({ contact }).lean<IPatient>().exec()) || undefined;
    }
    return this.patients.find((patient) => patient.contact === contact);
  }

  async addPatient(patient: IPatient): Promise<IPatient> {
    if (isMongoConnected) {
      const createdPatient = await PatientModel.create(patient);
      const storedPatient = createdPatient.toObject() as IPatient;
      this.patients.unshift(storedPatient);
      return storedPatient;
    }
    this.patients.unshift(patient);
    return patient;
  }

  async createPatientProfile(input: Omit<IPatient, '_id' | 'patientId'>): Promise<IPatient> {
    const year = new Date().getFullYear();
    let sequence: number;
    if (isMongoConnected) {
      const counter = await SequenceCounterModel.findByIdAndUpdate(
        `patient-${year}`,
        { $inc: { sequence: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ).lean<{ sequence: number }>().exec();
      sequence = counter?.sequence || 1;
    } else {
      const pattern = new RegExp(`^PAT-${year}-(\\d+)$`);
      sequence = this.patients.reduce((currentMax, patient) => {
        const match = patient.patientId.match(pattern);
        return match ? Math.max(currentMax, Number(match[1])) : currentMax;
      }, 0) + 1;
    }

    return this.addPatient({
      ...input,
      _id: `pat-${randomUUID()}`,
      patientId: `PAT-${year}-${String(sequence).padStart(6, '0')}`,
    });
  }

  async deletePatientById(id: string): Promise<void> {
    if (isMongoConnected) await PatientModel.deleteOne({ _id: id }).exec();
    this.patients = this.patients.filter((patient) => patient._id !== id);
  }

  // Test Catalog Operations
  getTests(): ITestCatalog[] {
    return this.tests;
  }

  // Sample Operations
  getSamples(): ISample[] {
    return this.samples;
  }

  findSampleById(id: string): ISample | undefined {
    return this.samples.find((s) => s._id === id || s.sampleId === id);
  }

  addSample(sample: ISample): ISample {
    this.samples.unshift(sample);
    return sample;
  }

  updateSample(sampleId: string, updates: Partial<ISample>): ISample | undefined {
    const idx = this.samples.findIndex((s) => s.sampleId === sampleId || s._id === sampleId);
    if (idx !== -1) {
      this.samples[idx] = { ...this.samples[idx], ...updates };
      return this.samples[idx];
    }
    return undefined;
  }

  // Result Operations
  getResults(): IResult[] {
    return this.results;
  }

  findResultBySampleId(sampleId: string): IResult | undefined {
    return this.results.find((r) => r.sampleId === sampleId);
  }

  saveResult(result: IResult): IResult {
    const idx = this.results.findIndex((r) => r.sampleId === result.sampleId);
    if (idx !== -1) {
      this.results[idx] = { ...this.results[idx], ...result };
      return this.results[idx];
    } else {
      this.results.unshift(result);
      return result;
    }
  }

  // Audit Logs
  addAuditLog(log: Omit<IAuditLog, '_id' | 'timestamp'>): IAuditLog {
    const newLog: IAuditLog = {
      ...log,
      _id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date(),
    };
    this.auditLogs.unshift(newLog);
    return newLog;
  }

  getAuditLogs(): IAuditLog[] {
    return this.auditLogs;
  }

  // Notifications
  getNotifications(userId?: string): INotification[] {
    if (userId) {
      return this.notifications.filter((n) => n.userId === userId || n.userId === 'all');
    }
    return this.notifications;
  }

  addNotification(notif: Omit<INotification, '_id' | 'createdAt'>): INotification {
    const newNotif: INotification = {
      ...notif,
      _id: `notif-${Date.now()}`,
      createdAt: new Date(),
    };
    this.notifications.unshift(newNotif);
    return newNotif;
  }
}

export const dbStore = new DataStore();
