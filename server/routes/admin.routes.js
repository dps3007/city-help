import express from 'express';
import { getDashboardStats } from '../controllers/admin.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { checkHierarchy } from '../middlewares/hierarchy.middleware.js';

const router = express.Router();

router.get(
  '/dashboard',
  verifyJWT,
  checkHierarchy('DISTRICT_ADMIN'),
  getDashboardStats
);

export default router;
