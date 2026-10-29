import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth';
import { dbStore } from '../services/dataStore';
import { ITestCatalog, IUser } from '../types';

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  const { action, resource, search } = req.query;
  let logs = dbStore.getAuditLogs();

  if (action) {
    logs = logs.filter((l) => l.action === action);
  }

  if (resource) {
    logs = logs.filter((l) => l.resource.toLowerCase().includes(String(resource).toLowerCase()));
  }

  if (search) {
    const q = String(search).toLowerCase();
    logs = logs.filter(
      (l) =>
        l.user.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q)
    );
  }

  return res.json({ success: true, count: logs.length, logs });
};

export const getTestCatalog = async (req: AuthRequest, res: Response) => {
  const tests = dbStore.getTests();
  return res.json({ success: true, count: tests.length, tests });
};

export const createTestCatalogItem = async (req: AuthRequest, res: Response) => {
  const { code, name, category, price, turnaroundHours, parameters } = req.body;

  if (!code || !name || !category || !price) {
    return res.status(400).json({ success: false, message: 'Code, name, category, and price are required' });
  }

  const newTest: ITestCatalog = {
    _id: `tst-${Date.now()}`,
    code,
    name,
    category,
    price: Number(price),
    turnaroundHours: Number(turnaroundHours) || 12,
    parameters: Array.isArray(parameters) ? parameters : [],
  };

  dbStore.tests.push(newTest);

  dbStore.addAuditLog({
    user: req.user?.name || 'Admin',
    role: req.user?.role || 'Administrator',
    action: 'CREATE_TEST_CATALOG',
    resource: code,
    details: `Added new test ${name} (${code}) to catalog`,
    ipAddress: req.ip || '127.0.0.1',
  });

  return res.status(201).json({ success: true, test: newTest });
};

export const getDepartments = async (req: AuthRequest, res: Response) => {
  const departments = [
    { name: 'Hematology', code: 'HEM', activeEquipments: ['Sysmex XN-1000', 'Mindray BC-5000'], totalTests: 124 },
    { name: 'Biochemistry', code: 'BIO', activeEquipments: ['Cobas c311', 'Roche Elecsys'], totalTests: 310 },
    { name: 'Urinalysis & Clinical Microscopy', code: 'URN', activeEquipments: ['Sysmex UF-5000'], totalTests: 88 },
    { name: 'Endocrinology & Immunoassay', code: 'END', activeEquipments: ['Beckman Access 2'], totalTests: 145 },
    { name: 'Microbiology & Molecular', code: 'MIC', activeEquipments: ['GeneXpert IV', 'VITEK 2'], totalTests: 62 },
  ];
  return res.json({ success: true, departments });
};

export const getUserRoleHistory = async (req: AuthRequest, res: Response) => {
  const history = await dbStore.getUserRoleHistory(req.params.userId);
  if (!history) {
    return res.status(404).json({ success: false, message: 'User account not found' });
  }
  return res.json({ success: true, history });
};

// Admin User Management Operations
export const createUserByAdmin = async (req: AuthRequest, res: Response) => {
  const { name, email, password, role, phone, department } = req.body;

  const existing = await dbStore.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ success: false, message: 'User with this email already exists' });
  }

  const newUser: IUser = {
    _id: `usr-${Date.now()}`,
    name,
    email,
    password: bcrypt.hashSync(password, 10),
    role,
    phone: phone || '',
    department: department || 'General',
    isActive: true,
    createdAt: new Date(),
  };

  await dbStore.addUser(newUser);

  dbStore.addAuditLog({
    user: req.user?.name || 'Administrator',
    role: req.user?.role || 'Administrator',
    action: 'CREATE_STAFF_USER',
    resource: email,
    details: `Admin created user ${email} with assigned role '${role}'`,
    ipAddress: req.ip || '127.0.0.1',
  });

  const { password: _, ...userWithoutPassword } = newUser;
  return res.status(201).json({ success: true, user: userWithoutPassword });
};

export const changeUserRole = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const { newRole, reason } = req.body;

  const user = await dbStore.findUserById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User account not found' });
  }

  const previousRole = user.role;
  const updatedUser = await dbStore.updateUserRole(userId, newRole, {
    administratorId: req.user?._id || '',
    administratorName: req.user?.name || 'Administrator',
    previousRole,
    newRole,
    reason,
    timestamp: new Date(),
  });
  if (!updatedUser) {
    return res.status(404).json({ success: false, message: 'User account not found' });
  }

  dbStore.addAuditLog({
    user: req.user?.name || 'Administrator',
    role: req.user?.role || 'Administrator',
    action: 'USER_ROLE_CHANGED',
    resource: updatedUser.email,
    details: `Administrator ${req.user?.name} changed role of ${user.name} (${user.email}) from '${previousRole}' to '${newRole}'. Reason: "${reason}"`,
    oldValue: previousRole,
    newValue: newRole,
    ipAddress: req.ip || '127.0.0.1',
  });

  const { password: _, ...userWithoutPassword } = updatedUser;
  return res.json({
    success: true,
    message: `Role for ${user.name} successfully updated to ${newRole}`,
    user: userWithoutPassword,
  });
};

export const toggleUserStatus = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const { isActive, reason } = req.body;

  const user = await dbStore.findUserById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User account not found' });
  }

  const prevStatus = user.isActive !== false ? 'Active' : 'Deactivated';
  const updatedUser = await dbStore.updateUserStatus(userId, isActive);
  if (!updatedUser) {
    return res.status(404).json({ success: false, message: 'User account not found' });
  }
  const newStatus = isActive ? 'Active' : 'Deactivated';

  dbStore.addAuditLog({
    user: req.user?.name || 'Administrator',
    role: req.user?.role || 'Administrator',
    action: 'USER_STATUS_CHANGED',
    resource: updatedUser.email,
    details: `Administrator ${req.user?.name} updated user status for ${user.name} from '${prevStatus}' to '${newStatus}'. Reason: "${reason || 'N/A'}"`,
    oldValue: prevStatus,
    newValue: newStatus,
    ipAddress: req.ip || '127.0.0.1',
  });

  const { password: _, ...userWithoutPassword } = updatedUser;
  return res.json({
    success: true,
    message: `Account status for ${user.name} set to ${newStatus}`,
    user: userWithoutPassword,
  });
};
