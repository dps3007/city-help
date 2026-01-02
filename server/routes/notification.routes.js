import express from 'express';
import {
  getMyNotifications,
  markAsRead,
} from '../controllers/notification.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', verifyJWT, getMyNotifications);
router.patch('/:id/read', verifyJWT, markAsRead);

export default router;

