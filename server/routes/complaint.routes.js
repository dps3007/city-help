import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createComplaintSchema } from "../validators/complaint.validator.js";
import upload from "../middlewares/upload.middleware.js";

import {
  createComplaint,
  getAllComplaints,
  getComplaints,
  getComplaintById,
  verifyComplaint,
  assignComplaint,
  startWork,
  resolveComplaint,
  closeComplaint,
  upvoteComplaint,
  submitFeedback,
  getFeed,
} from "../controllers/complaint.controller.js";

const router = Router();

console.log("✅ complaint routes file loaded");

/* ================== FEED (MUST BE FIRST) ================== */
router.get(
  "/feed",
  verifyJWT,
  getFeed
);

/* ================== CREATE ================== */
router.post(
  "/",
  verifyJWT,
  checkRole("CITIZEN"),
  upload.single("image"),
  validate(createComplaintSchema),
  createComplaint
);

/* ================== LIST ================== */
router.get("/", verifyJWT, getComplaints);
router.get("/admin/all", verifyJWT, checkRole("OFFICER"), getAllComplaints);

/* ================== ACTIONS ================== */
router.patch("/:id/assign", verifyJWT, checkRole("DEPT_HEAD"), assignComplaint);
router.patch("/:id/verify", verifyJWT, checkRole("DEPT_HEAD"), verifyComplaint);
router.patch("/:id/start-work", verifyJWT, checkRole("OFFICER"), startWork);
router.patch("/:id/resolve", verifyJWT, checkRole("OFFICER"), resolveComplaint);
router.patch("/:id/close", verifyJWT, checkRole("DEPT_HEAD"), closeComplaint);

router.post("/:id/upvote", verifyJWT, checkRole("CITIZEN"), upvoteComplaint);
router.post("/:id/feedback", verifyJWT, checkRole("CITIZEN"), submitFeedback);

/* ================== GET BY ID (LAST!) ================== */
router.get("/:id", verifyJWT, getComplaintById);

export default router;
