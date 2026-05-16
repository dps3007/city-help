import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";
import {
  createFeedback,
  getComplaintFeedbacks
} from "../controllers/feedback.controller.js";

const router = Router();

// Citizen -> submit feedback
router.post("/", verifyJWT, checkRole("CITIZEN"), createFeedback);

// Get feedbacks for a complaint (CITIZEN or assigned OFFICER)
router.get("/complaint/:complaintId", verifyJWT, getComplaintFeedbacks); 

export default router;
