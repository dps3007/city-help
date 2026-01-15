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

router.post(
  "/",
  verifyJWT,
  checkRole("CITIZEN"),
  validate(createComplaintSchema),
  createComplaint
);

router.get("/", verifyJWT, getComplaints);

router.get("/:id", verifyJWT, getComplaintById);

router.patch(
  "/:id/assign",
  verifyJWT,
  checkRole("DEPT_HEAD"),
  assignComplaint
);

router.patch(
  "/:id/verify",
  verifyJWT,
  checkRole("OFFICER"),
  verifyComplaint
);

router.patch(
  "/:id/start-work",
  verifyJWT,
  checkRole("OFFICER"),
  startWork
);

router.patch(
  "/:id/resolve",
  verifyJWT,
  checkRole("OFFICER"),
  resolveComplaint
);

router.patch(
  "/:id/close",
  verifyJWT,
  checkRole("DEPT_HEAD"),
  closeComplaint
);

export default router;
