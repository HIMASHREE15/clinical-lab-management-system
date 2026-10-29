import { Router } from 'express';
import {
  getAuditLogs,
  getTestCatalog,
  createTestCatalogItem,
  getDepartments,
  getUserRoleHistory,
  createUserByAdmin,
  changeUserRole,
  toggleUserStatus,
} from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createUserByAdminSchema, changeUserRoleSchema, toggleUserStatusSchema } from '../validators/zodSchemas';
import { ROLES, STAFF_ROLES } from '../config/constants';

const router = Router();

router.get('/audit-logs', authenticate, authorizeRoles(ROLES.ADMIN), getAuditLogs);
router.get('/test-catalog', authenticate, authorizeRoles(...STAFF_ROLES), getTestCatalog);
router.post('/test-catalog', authenticate, authorizeRoles(ROLES.ADMIN), createTestCatalogItem);
router.get('/departments', authenticate, authorizeRoles(...STAFF_ROLES), getDepartments);

// Administrator User & Role Management APIs
router.get('/users/:userId/role-history', authenticate, authorizeRoles(ROLES.ADMIN), getUserRoleHistory);
router.post('/users', authenticate, authorizeRoles(ROLES.ADMIN), validate(createUserByAdminSchema), createUserByAdmin);
router.patch('/users/:userId/role', authenticate, authorizeRoles(ROLES.ADMIN), validate(changeUserRoleSchema), changeUserRole);
router.patch('/users/:userId/status', authenticate, authorizeRoles(ROLES.ADMIN), validate(toggleUserStatusSchema), toggleUserStatus);

export default router;
