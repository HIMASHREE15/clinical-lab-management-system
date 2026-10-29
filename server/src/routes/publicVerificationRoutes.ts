import { Router } from 'express';
import { verifyPublicReport } from '../controllers/publicVerificationController';

const router = Router();

router.get('/verify-report/:reportId', verifyPublicReport);

export default router;
