import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbStore } from '../services/dataStore';
import { IUser } from '../types';

export interface AuthRequest extends Request {
  user?: IUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'clinical_lab_super_secret_jwt_key_2026';

export const generateToken = (user: IUser) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const generateRefreshToken = (user: IUser) => {
  return jwt.sign(
    { id: user._id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token) {
    token = String(req.query.token);
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authorization token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await dbStore.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User account not found' });
    }
    if (user.isActive === false) {
      return res.status(401).json({ success: false, message: 'Account is deactivated. Please contact system administrator.' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
