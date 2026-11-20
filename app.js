import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { UPLOAD_DIR } from './middleware/upload.js';
import { notFound, errorHandler } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import alertRoutes from './routes/alerts.js';
import incidentRoutes from './routes/incidents.js';
import requestRoutes from './routes/requests.js';
import statsRoutes from './routes/stats.js';

export const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',') }));
app.use(express.json({ limit: '100kb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use('/uploads', express.static(UPLOAD_DIR));

// Monitoring: a simple health probe for uptime checks
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptimeSeconds: Math.round(process.uptime()),
  });
});

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: true, legacyHeaders: false });
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/stats', statsRoutes);

app.use(notFound);
app.use(errorHandler);
