import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { apiRateLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/authRoutes';
import sampleRoutes from './routes/sampleRoutes';
import resultRoutes from './routes/resultRoutes';
import patientRoutes from './routes/patientRoutes';
import adminRoutes from './routes/adminRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import notificationRoutes from './routes/notificationRoutes';
import publicVerificationRoutes from './routes/publicVerificationRoutes';

dotenv.config();

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(apiRateLimiter);

// Public API Routes
app.use('/api/public', publicVerificationRoutes);

// Authenticated API Routes
app.use('/api/auth', authRoutes);
app.use('/api/samples', sampleRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Clinical Laboratory Sample Tracking & Result Delivery System',
    timestamp: new Date().toISOString(),
  });
});

export default app;
