import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getCurrentUser,
  updateCurrentUser,
  getMyComplaints
} from "../controllers/user.controller.js";

const router = Router();

router.get("/me", verifyJWT, getCurrentUser);
router.patch("/me", verifyJWT, updateCurrentUser);
router.get("/my-complaints", verifyJWT, getMyComplaints);

export default router;
