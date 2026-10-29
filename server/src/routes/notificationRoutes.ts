import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';
import { ALL_ROLES } from '../config/constants';

const router = Router();

router.get('/', authenticate, authorizeRoles(...ALL_ROLES), getNotifications);
router.patch('/:id/read', authenticate, authorizeRoles(...ALL_ROLES), markAsRead);

export default router;
