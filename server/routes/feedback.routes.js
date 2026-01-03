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
router.post("/", verifyJWT, checkRole("citizen"), createFeedback);

// Admin
router.get("/", verifyJWT, checkRole("admin"), getAllFeedbacks);
router.get("/:complaintId", verifyJWT, checkRole("admin"), getFeedbackByComplaint);

export default router;
