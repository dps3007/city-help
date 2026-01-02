import express from 'express';
import { getMyRewards } from '../controllers/reward.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/me', verifyJWT, getMyRewards);

export default router;
