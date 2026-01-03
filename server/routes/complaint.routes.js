import { Router } from "express";
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  verifyComplaint,
  resolveComplaint,
} from "../controllers/complaint.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = Router();

/* =========================
   CITIZEN ROUTES
========================= */

// Create a complaint
router.post(
  "/",
  verifyJWT,
  checkRole("CITIZEN"),
  createComplaint
);

// Get own complaints
router.get(
  "/",
  verifyJWT,
  getComplaints
);

// Get complaint by ID (role-based access handled in controller)
router.get(
  "/:id",
  verifyJWT,
  getComplaintById
);

/* =========================
   OFFICER / ADMIN ROUTES
========================= */

// Verify complaint
router.patch(
  "/:id/verify",
  verifyJWT,
  checkRole("OFFICER", "ADMIN"),
  verifyComplaint
);

// Resolve complaint
router.patch(
  "/:id/resolve",
  verifyJWT,
  checkRole("OFFICER", "ADMIN"),
  resolveComplaint
);

export default router;
