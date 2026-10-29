import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';
import { ALL_ROLES } from '../config/constants';

const router = Router();

router.get('/dashboard', authenticate, authorizeRoles(...ALL_ROLES), getDashboardAnalytics);

export default router;
