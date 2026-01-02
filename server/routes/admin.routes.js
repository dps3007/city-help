import express from 'express';
import { getDashboardStats, manageUser,getAllUsers,
  updateUserStatus, createUser
 } from '../controllers/admin.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/role.middleware.js';
import { adminLimiter } from '../middlewares/rateLimit.middleware.js';
import { getAdminComplaints } from '../controllers/admin.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { manageUserSchema } from '../validators/admin.validators.js';


const router = express.Router();

router.get(
  '/dashboard',
  verifyJWT,adminLimiter,
  checkRole('DISTRICT_ADMIN'),
  getDashboardStats
);

router.get(
  '/complaints',
  verifyJWT,
  checkRole('DISTRICT_ADMIN'),
  getAdminComplaints
);

router.post(
  '/users/manage',
  verifyJWT,
  adminLimiter,
  checkRole('DISTRICT_ADMIN'),
  validate(manageUserSchema),
  manageUser
);

router.get("/users", verifyJWT, checkRole("admin"), getAllUsers);

router.patch("/users/:id/status", verifyJWT, checkRole("admin"), updateUserStatus);

router.post(
  "/users",
  verifyJWT,
  checkRole("admin"),
  createUser
);




export default router;
