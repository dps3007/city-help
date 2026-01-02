import express from 'express';
import {
  getMyProfile,
  updateMyProfile,
  getAllUsers,
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/role.middleware.js';

const router = express.Router();

router.get('/me', verifyJWT, getMyProfile);
router.patch('/me', verifyJWT, updateMyProfile);

router.get('/', verifyJWT, checkRole(['SUPER_ADMIN']), getAllUsers);

export default router;
