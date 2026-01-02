import express from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
} from '../controllers/complaint.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createComplaintSchema } from '../validators/complaint.validator.js';

const router = express.Router();

// Citizen
router.post(
  '/',
  verifyJWT,
  checkRole(['CITIZEN']),
  validate(createComplaintSchema),
  createComplaint
);

router.get('/me', verifyJWT, checkRole(['CITIZEN']), getComplaints);



// Shared
router.get('/:complaintId', verifyJWT, getComplaintById);


export default router;
