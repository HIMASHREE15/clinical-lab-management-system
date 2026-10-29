import { Router } from 'express';
import { getPatients, registerPatient, getPatientHistory } from '../controllers/patientController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';
import { ALL_ROLES, ROLES, STAFF_ROLES } from '../config/constants';

const router = Router();

router.get('/', authenticate, authorizeRoles(...STAFF_ROLES), getPatients);
router.post('/', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.RECEPTIONIST), registerPatient);
router.get('/:id/history', authenticate, authorizeRoles(...ALL_ROLES), getPatientHistory);

export default router;
