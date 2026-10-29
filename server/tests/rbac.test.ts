import request from 'supertest';
import app from '../src/app';
import { UserModel } from '../src/models/User';

describe('Role Management Policy & RBAC Tests', () => {
  let adminToken: string;
  let techToken: string;

  beforeAll(async () => {
    // Login as Admin
    const adminRes = await request(app).post('/api/auth/login').send({
      email: 'admin@clinicallab.com',
      password: 'password123',
    });
    adminToken = adminRes.body.token;

    // Login as Tech
    const techRes = await request(app).post('/api/auth/login').send({
      email: 'tech@clinicallab.com',
      password: 'password123',
    });
    techToken = techRes.body.token;
  });

  it('POLICY 9: User model defaults to Patient and rejects roles outside the enum', () => {
    const baseUser = {
      _id: 'schema-policy-user',
      name: 'Schema Policy User',
      email: 'schema-policy@example.com',
      password: 'hashed-password',
      createdAt: new Date(),
    };
    const defaultUser = new UserModel(baseUser);
    const invalidRoleUser = new UserModel({ ...baseUser, role: 'SUPERUSER' } as any);

    expect(defaultUser.role).toBe('Patient');
    expect(invalidRoleUser.validateSync()?.errors.role).toBeDefined();
  });

  it('POLICY 4: Public registration rejects role selection and creates only patient accounts', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Hacker User',
      email: `hacker-${Date.now()}@example.com`,
      dateOfBirth: '1990-01-01',
      gender: 'Other',
      phone: '+1 555 010 2233',
      password: 'password123',
      confirmPassword: 'password123',
      role: 'Administrator', // Client tries to request Admin role
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POLICY 4: First-time patient registration creates a linked profile and no sample', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'First Visit Patient',
      email: `first-visit-${Date.now()}@example.com`,
      dateOfBirth: '1990-01-01',
      gender: 'Female',
      phone: '+1 555 010 2244',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('Patient');
    expect(res.body.patientId).toMatch(/^PAT-\d{4}-\d{6}$/);
    expect(res.body.user.patientId).toBe(res.body.patientId);
    expect(res.body.patient.userId).toBe(res.body.user._id);
    expect(res.body.patient.dateOfBirth).toBeDefined();
    expect(res.body.patient.registeredAt).toBeDefined();

    const samplesRes = await request(app)
      .get('/api/samples')
      .set('Authorization', `Bearer ${res.body.token}`);
    expect(samplesRes.status).toBe(200);
    expect(samplesRes.body.samples).toEqual([]);
  });

  it('POLICY 7: Receptionist intake refuses to duplicate an existing patient', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${techToken}`)
      .send({
        name: 'Duplicate Patient Attempt',
        age: 30,
        gender: 'Female',
        contact: '+1 (555) 019-7755',
      });

    expect(res.status).toBe(403);

    const receptionistRes = await request(app).post('/api/auth/login').send({
      email: 'reception@clinicallab.com',
      password: 'password123',
    });
    const duplicateRes = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${receptionistRes.body.token}`)
      .send({
        name: 'Duplicate Patient Attempt',
        age: 30,
        gender: 'Female',
        contact: '+1 (555) 019-7755',
      });

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.patient.patientId).toBe('PT1002');

    const sampleRes = await request(app)
      .post('/api/samples')
      .set('Authorization', `Bearer ${receptionistRes.body.token}`)
      .send({ patientId: 'PT1002', testCode: 'URINE-01' });
    expect(sampleRes.status).toBe(201);

    const collectedRes = await request(app)
      .patch(`/api/samples/${sampleRes.body.sample.sampleId}/status`)
      .set('Authorization', `Bearer ${receptionistRes.body.token}`)
      .send({ status: 'COLLECTED' });
    expect(collectedRes.status).toBe(200);
    expect(collectedRes.body.sample.status).toBe('COLLECTED');

    const unauthorizedAdvance = await request(app)
      .patch(`/api/samples/${sampleRes.body.sample.sampleId}/status`)
      .set('Authorization', `Bearer ${receptionistRes.body.token}`)
      .send({ status: 'RECEIVED_IN_LAB' });
    expect(unauthorizedAdvance.status).toBe(403);
  });

  it('POLICY 8: Deactivation immediately invalidates already-issued access tokens', async () => {
    const registration = await request(app).post('/api/auth/register').send({
      name: 'Session Policy Patient',
      email: `session-policy-${Date.now()}@example.com`,
      dateOfBirth: '1990-01-01',
      gender: 'Other',
      phone: '+1 555 010 2255',
      password: 'password123',
      confirmPassword: 'password123',
    });
    const patientId = registration.body.user._id;
    const patientToken = registration.body.token;

    await request(app)
      .patch(`/api/admin/users/${patientId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false, reason: 'Session invalidation test' });

    const profileRes = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(profileRes.status).toBe(401);
    expect(profileRes.body.message).toContain('Account is deactivated');

    await request(app)
      .patch(`/api/admin/users/${patientId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: true, reason: 'Session invalidation test cleanup' });
  });

  it('POLICY 3 & 7: Non-administrator (Technician) cannot modify user roles (Returns 403)', async () => {
    const res = await request(app)
      .patch('/api/admin/users/usr-tech-1/role')
      .set('Authorization', `Bearer ${techToken}`)
      .send({
        newRole: 'Administrator',
        reason: 'Unauthorized role self-promotion',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('POLICY 3 & 7: Non-administrators cannot list users or view role history', async () => {
    const [usersRes, auditRes] = await Promise.all([
      request(app).get('/api/auth/users').set('Authorization', `Bearer ${techToken}`),
      request(app).get('/api/admin/audit-logs').set('Authorization', `Bearer ${techToken}`),
    ]);

    expect(usersRes.status).toBe(403);
    expect(auditRes.status).toBe(403);
  });

  it('POLICY 3: Patient accounts can read only their own sample records', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'patient@clinicallab.com',
      password: 'password123',
    });
    const patientToken = loginRes.body.token;

    const ownSample = await request(app)
      .get('/api/samples/SMP1002')
      .set('Authorization', `Bearer ${patientToken}`);
    const otherSample = await request(app)
      .get('/api/samples/SMP1001')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(ownSample.status).toBe(200);
    expect(otherSample.status).toBe(404);

    const ownHistory = await request(app)
      .get('/api/patients/PT1002/history')
      .set('Authorization', `Bearer ${patientToken}`);
    const otherHistory = await request(app)
      .get('/api/patients/PT1001/history')
      .set('Authorization', `Bearer ${patientToken}`);
    const otherResult = await request(app)
      .get('/api/results/sample/SMP1001')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(ownHistory.status).toBe(200);
    expect(otherHistory.status).toBe(404);
    expect(otherResult.status).toBe(404);
  });

  it('POLICY 8: An existing token uses the current server-assigned role', async () => {
    const registration = await request(app).post('/api/auth/register').send({
      name: 'Role Refresh Patient',
      email: `role-refresh-${Date.now()}@example.com`,
      dateOfBirth: '1990-01-01',
      gender: 'Other',
      phone: '+1 555 010 2266',
      password: 'password123',
      confirmPassword: 'password123',
    });
    const userId = registration.body.user._id;
    const token = registration.body.token;

    await request(app)
      .patch(`/api/admin/users/${userId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ newRole: 'Laboratory Technician', reason: 'Role refresh test' });

    const promotedResponse = await request(app)
      .get('/api/patients')
      .set('Authorization', `Bearer ${token}`);
    expect(promotedResponse.status).toBe(200);

    await request(app)
      .patch(`/api/admin/users/${userId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ newRole: 'Patient', reason: 'Role refresh test cleanup' });

    const demotedResponse = await request(app)
      .get('/api/patients')
      .set('Authorization', `Bearer ${token}`);
    expect(demotedResponse.status).toBe(403);
  });

  it('POLICY 7: Administrator can change user role and record an audit log', async () => {
    const res = await request(app)
      .patch('/api/admin/users/usr-patient-1/role')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        newRole: 'Laboratory Technician',
        reason: 'Promoted to Lab Staff after credential check',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('Laboratory Technician');

    const auditRes = await request(app)
      .get('/api/admin/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);
    const roleChangeLog = auditRes.body.logs.find(
      (log: { action: string; resource: string }) => log.action === 'USER_ROLE_CHANGED' && log.resource === 'patient@clinicallab.com'
    );
    expect(roleChangeLog.oldValue).toBe('Patient');
    expect(roleChangeLog.newValue).toBe('Laboratory Technician');
    expect(roleChangeLog.details).toContain('Promoted to Lab Staff after credential check');
    expect(roleChangeLog.timestamp).toBeDefined();

    const historyRes = await request(app)
      .get('/api/admin/users/usr-patient-1/role-history')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(historyRes.status).toBe(200);
    expect(historyRes.body.history.at(-1).previousRole).toBe('Patient');
    expect(historyRes.body.history.at(-1).reason).toBe('Promoted to Lab Staff after credential check');
  });

  it('POLICY 5: Deactivated user account is denied login', async () => {
    // 1. Admin deactivates patient
    await request(app)
      .patch('/api/admin/users/usr-patient-1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        isActive: false,
        reason: 'Account suspended by policy test',
      });

    // 2. Patient attempts login
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'patient@clinicallab.com',
      password: 'password123',
    });

    expect(loginRes.status).toBe(403);
    expect(loginRes.body.success).toBe(false);
    expect(loginRes.body.message).toContain('Account is deactivated');

    // 3. Admin reactivates patient
    await request(app)
      .patch('/api/admin/users/usr-patient-1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        isActive: true,
        reason: 'Re-activated patient test account',
      });
  });
});
