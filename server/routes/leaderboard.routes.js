import express from "express";
import {
  getGlobalLeaderboard,
  getLocalLeaderboard,
} from "../controllers/leaderboard.controller.js";

const router = express.Router();

// 🌍 Global
router.get("/global", getGlobalLeaderboard);

// 🏘️ Local (by municipal community)
router.get("/local/:municipalId", getLocalLeaderboard);

export default router;
