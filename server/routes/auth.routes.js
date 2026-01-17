import express from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
} from '../controllers/auth.controller.js';
import { authLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

// Register with Rate Limiting
router.post('/register',authLimiter, register);

// Login route with rate limiting applied
router.post('/login', authLimiter,login);

// Token refresh route
router.post('/refresh', refreshToken);

// Logout route
router.post('/logout',logout);

export default router;
