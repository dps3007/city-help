import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";
import {
  createFeedback,
  getFeedbackByComplaint,
  getAllFeedbacks
} from "../controllers/feedback.controller.js";

const router = Router();

// Citizen
router.post("/", verifyJWT, checkRole("CITIZEN"), createFeedback);

// Admin
router.get("/", verifyJWT, checkRole("DEPT_HEAD"), getAllFeedbacks);

router.get("/:complaintId", verifyJWT, checkRole("DEPT_HEAD"), getFeedbackByComplaint);

export default router;
