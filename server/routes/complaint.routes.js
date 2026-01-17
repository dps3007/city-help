import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createComplaintSchema } from "../validators/complaint.validator.js";

import {
  createComplaint,
  getComplaints,
  getComplaintById,
  verifyComplaint,
  assignComplaint,
  startWork,
  resolveComplaint,
  closeComplaint,
} from "../controllers/complaint.controller.js";

const router = Router();

// Citizen → create complaint
router.post(
  "/",
  verifyJWT,
  checkRole("CITIZEN"),
  validate(createComplaintSchema),
  createComplaint
);

// Citizen / Officer → get own complaints
router.get("/", verifyJWT, getComplaints);

// Get complaint by ID with access control
router.get("/:id", verifyJWT, getComplaintById);

// Dept Head → assign complaint
router.patch(
  "/:id/assign",
  verifyJWT,
  checkRole("DEPT_HEAD"),
  assignComplaint
);

// Dept Head → verify complaint
router.patch(
  "/:id/verify",
  verifyJWT,
  checkRole("DEPT_HEAD"),
  verifyComplaint
);

// Officer → start work on complaint
router.patch(
  "/:id/start-work",
  verifyJWT,
  checkRole("OFFICER"),
  startWork
);

// Officer → resolve complaint
router.patch(
  "/:id/resolve",
  verifyJWT,
  checkRole("OFFICER"),
  resolveComplaint
);

// Dept Head → close complaint
router.patch(
  "/:id/close",
  verifyJWT,
  checkRole("DEPT_HEAD"),
  closeComplaint
);

export default router;
