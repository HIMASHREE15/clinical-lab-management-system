import { Router } from 'express';
import {
  getAllResults,
  getResultBySampleId,
  saveResult,
  verifyResult,
  downloadReportPDF,
  getPatientTrends,
} from '../controllers/resultController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';
import { ALL_ROLES, ROLES } from '../config/constants';

const router = Router();

router.get('/', authenticate, authorizeRoles(...ALL_ROLES), getAllResults);
router.get('/sample/:sampleId', authenticate, authorizeRoles(...ALL_ROLES), getResultBySampleId);
router.post('/save', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.TECHNICIAN), saveResult);
router.post('/verify/:sampleId', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.DOCTOR), verifyResult);
router.get('/pdf/:sampleId', authenticate, authorizeRoles(...ALL_ROLES), downloadReportPDF);
router.get('/trends/:patientId', authenticate, authorizeRoles(...ALL_ROLES), getPatientTrends);

export default router;
