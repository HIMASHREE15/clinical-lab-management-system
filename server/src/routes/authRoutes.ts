import { Router } from 'express';
import { login, register, getProfile, getUsers } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';
import { ALL_ROLES, ROLES } from '../config/constants';
import { validate } from '../middleware/validate';
import { registerUserSchema } from '../validators/zodSchemas';

const router = Router();

router.post('/login', login);
router.post('/register', validate(registerUserSchema), register);
router.get('/profile', authenticate, authorizeRoles(...ALL_ROLES), getProfile);
router.get('/users', authenticate, authorizeRoles(ROLES.ADMIN), getUsers);

export default router;
