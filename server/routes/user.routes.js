import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getCurrentUser,
  updateCurrentUser,
  getMyComplaints
} from "../controllers/user.controller.js";

const router = Router();

// get current user
router.get("/me", verifyJWT, getCurrentUser);

// update user
router.patch("/me", verifyJWT, updateCurrentUser);

// get complaints by user
router.get("/my-complaints", verifyJWT, getMyComplaints);

export default router;
