import "./config/env.js"; 

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import complaintRoutes from './routes/complaint.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import rewardRoutes from './routes/reward.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

import helmet from "helmet";

const app = express();

// Enable CORS
app.use(cors());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use(helmet());

// HTTP request logger
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/rewards', rewardRoutes);
app.use('/api/v1/admin', adminRoutes);

// Health check endpoint
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'OK' });
});

// Global error handler
app.use(errorHandler);

export default app;
