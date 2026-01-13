import express from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
} from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

router.post('/register',authLimiter, register);
router.post('/login', authLimiter,login);
router.post('/refresh', refreshToken);
router.post('/logout', verifyJWT, logout);

export default router;
qwx