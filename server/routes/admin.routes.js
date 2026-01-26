import express from 'express';
import { 
  getDashboardStats, 
  getAdminComplaints,
  manageUser, 
  getAllUsers,
  createUser
 } from '../controllers/admin.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/role.middleware.js';


const router = express.Router();

// admin deshboard
router.get(
  '/dashboard',
  verifyJWT,
  checkRole('DISTRICT_ADMIN'),
  getDashboardStats
);

// get complaints
router.get(
  '/complaints',
  verifyJWT,
  checkRole('DISTRICT_ADMIN'),
  getAdminComplaints
);

// manage users
router.patch(
  '/users/:id/role',
  verifyJWT,
  checkRole('DEPT_HEAD'),
  manageUser
);

// get all users
router.get("/users", verifyJWT, checkRole("DISTRICT_ADMIN"), getAllUsers);

// create authority
router.post(
  "/users",
  verifyJWT,
  checkRole("DEPT_HEAD"),
  createUser
);

export default router;
