import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";
import {
  getMyRewards,
  getUserRewards,
  getRewardHistory,
} from "../controllers/reward.controller.js";

const router = Router();

// Citizen / Officer → own rewards
router.get(
  "/", 
  verifyJWT, 
  getMyRewards
);

// Admin → rewards of any user
router.get(
  "/user/:userId",
  verifyJWT,
  checkRole("DEPT_HEAD"),
  getUserRewards
);

// reward history
router.get("/history",  
  verifyJWT,
  getRewardHistory);

export default router;
