import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";
import {
  createFeedback,
  getFeedbackByComplaint,
  getAllFeedbacks
} from "../controllers/feedback.controller.js";

const router = Router();

// Citizen -> submit feedback
router.post("/", verifyJWT, checkRole("CITIZEN"), createFeedback);

// Dept Head -> get all feedbacks
router.get("/", verifyJWT, checkRole("DEPT_HEAD"), getAllFeedbacks);

// Dept Head → get feedback for a specific complaint
router.get("/:complaintId", verifyJWT, checkRole("DEPT_HEAD"), getFeedbackByComplaint);

export default router;
