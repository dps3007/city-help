import express from 'express';
import { submitFeedback } from '../controllers/feedback.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/role.middleware.js';

const router = express.Router();

router.post('/:complaintId', verifyJWT, checkRole(['CITIZEN']), submitFeedback);

export default router;
