import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getCurrentUser,
  updateCurrentUser,
  getMyAllComplaints,
  getMyComplaintById
} from "../controllers/user.controller.js";

const router = Router();

// get current user
router.get("/me", verifyJWT, getCurrentUser);

// update user
router.patch("/me", verifyJWT, updateCurrentUser);

// get complaints by user
router.get("/my-complaints", verifyJWT, getMyAllComplaints);

router.get("/my-complaints/:id", verifyJWT, getMyComplaintById);

export default router;
