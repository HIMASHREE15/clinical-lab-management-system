import { Router } from 'express';
import { getSamples, getSampleById, createSample, updateStatus } from '../controllers/sampleController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';
import { ALL_ROLES, ROLES } from '../config/constants';

const router = Router();

router.get('/', authenticate, authorizeRoles(...ALL_ROLES), getSamples);
router.get('/:id', authenticate, authorizeRoles(...ALL_ROLES), getSampleById);
router.post('/', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.RECEPTIONIST), createSample);
router.patch('/:id/status', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.TECHNICIAN, ROLES.RECEPTIONIST), updateStatus);

export default router;
