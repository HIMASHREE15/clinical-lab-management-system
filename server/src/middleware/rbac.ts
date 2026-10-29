import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { UserRole } from '../config/constants';

export const normalizeRole = (role?: string): string => {
  if (!role) return '';
  if (role === 'Laboratory Technician' || role === 'Lab Technician') {
    return 'Lab Technician';
  }
  return role;
};

export const authorizeRoles = (...allowedRoles: (UserRole | string)[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userRoleNorm = normalizeRole(req.user.role);
    const allowedNorm = allowedRoles.map((r) => normalizeRole(r));

    if (!allowedNorm.includes(userRoleNorm)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized for this resource.`,
      });
    }

    next();
  };
};
