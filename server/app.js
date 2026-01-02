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
import mongoSanitize from 'express-mongo-sanitize';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

/* ---------- GLOBAL MIDDLEWARE ---------- */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize({replaceWith: '_',}));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

/* ---------- ROUTES ---------- */
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/rewards', rewardRoutes);
app.use('/api/v1/admin', adminRoutes);

/* ---------- HEALTH CHECK ---------- */
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'OK' });
});

/* ---------- ERROR HANDLER ---------- */
app.use(errorHandler);

export default app;
